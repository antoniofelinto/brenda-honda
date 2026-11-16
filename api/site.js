"use strict";
/* ------------------------------------------------------------------
   API única do site (Vercel Function): conteúdo editável + painel.
   Rotas (todas em /api/site?a=...):
     content  GET   conteúdo editado, lido pelo site público
     login    POST  { email, senha } -> token de 12 h
     check    GET   confere se o token ainda vale
     save     POST  { content }       (precisa do token)
     upload   POST  { data }          (precisa do token) imagem em dataURL
     img      GET   ?id=...           devolve a imagem enviada
     undo     POST  desfaz a última publicação (precisa do token)

   Onde ficam os dados: Redis (Upstash) ligado ao projeto no Vercel.
   Variáveis lidas: KV_REST_API_URL / KV_REST_API_TOKEN
                    (ou UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
   Obrigatórias: ADMIN_EMAIL e ADMIN_PASSWORD (acesso do painel; ficam só no Vercel,
                 nunca no código). Opcional: SESSION_SECRET.
------------------------------------------------------------------- */
const crypto = require("crypto");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""; // definida no Vercel (Settings > Environment Variables)
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const SECRET = process.env.SESSION_SECRET ||
  crypto.createHash("sha256").update("bh-session|" + ADMIN_EMAIL + "|" + ADMIN_PASSWORD).digest("hex");
const TTL = 12 * 3600 * 1000;
const K = { content: "bh:content", bak: "bh:content:bak" };
const IMG_URL = /^\/api\/site\?a=img&id=[a-f0-9]{16}$/;

/* ---------- Redis (REST) ---------- */
async function redis(cmd) {
  if (!REDIS_URL || !REDIS_TOKEN) { const e = new Error("storage-off"); e.code = "storage-off"; throw e; }
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + REDIS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || "redis " + r.status);
  return j.result;
}

/* ---------- acesso ---------- */
const sha = s => crypto.createHash("sha256").update(String(s)).digest();
const iguais = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
function senhaOk(pw) {
  if (!ADMIN_PASSWORD) return false;
  return iguais(pw, ADMIN_PASSWORD);
}
const b64u = b => Buffer.from(b).toString("base64url");
function criarToken() {
  const p = b64u(JSON.stringify({ e: ADMIN_EMAIL, x: Date.now() + TTL }));
  return p + "." + crypto.createHmac("sha256", SECRET).update(p).digest("base64url");
}
function tokenOk(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!m) return false;
  const [p, s] = m[1].split(".");
  if (!p || !s) return false;
  const esperado = crypto.createHmac("sha256", SECRET).update(p).digest("base64url");
  if (!iguais(s, esperado)) return false;
  try { return JSON.parse(Buffer.from(p, "base64url").toString()).x > Date.now(); } catch (e) { return false; }
}
const ipDe = req => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "x").split(",")[0].trim().replace(/[^\w.:-]/g, "").slice(0, 45);
const espera = ms => new Promise(r => setTimeout(r, ms));

/* ---------- limpeza do que chega do painel ---------- */
const txt = (v, max) => String(v == null ? "" : v).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const num = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n < 1e7 ? n : null; };
const fotoOk = u => typeof u === "string" && (IMG_URL.test(u) || /^assets\/(motos\/)?[\w.-]+\.webp$/.test(u));
const ENUM = {
  cat: ["dia", "scooter", "trail", "naked", "offroad"],
  tipo: ["cub", "scooter", "street", "trail", "scooter2", "adv", "naked"],
  camb: ["semi", "auto", "manual"]
};
function limparMoto(id, m) {
  const o = { id };
  o.nome = txt(m.nome, 60) || "Moto sem nome";
  o.tag = txt(m.tag, 140);
  for (const k of Object.keys(ENUM)) if (ENUM[k].includes(m[k])) o[k] = m[k];
  if (m.oculta) o.oculta = true;
  if (m.custom) o.custom = true;
  if (m.semQuiz) o.semQuiz = true;
  o.versoes = (Array.isArray(m.versoes) ? m.versoes : []).slice(0, 8)
    .map(v => ({ n: txt(v && v.n, 60), p: num(v && v.p) || null })).filter(v => v.n);
  o.cores = (Array.isArray(m.cores) ? m.cores : []).slice(0, 12).map(c => {
    const fotos = (Array.isArray(c && c.fotos) ? c.fotos : []).filter(fotoOk).slice(0, 8);
    const r = { n: txt(c && c.n, 40) || "Cor", h: /^#[0-9a-f]{6}$/i.test(c && c.h) ? c.h : "#9aa0ab", fotos };
    if (Array.isArray(c && c.legendas)) r.legendas = c.legendas.slice(0, 8).map(l => txt(l, 24));
    return r;
  });
  if (m.uso && typeof m.uso === "object") {
    o.uso = {};
    for (const k of ["trabalho", "cidade", "estrada", "lazer"]) o.uso[k] = Math.max(0, Math.min(3, parseInt(m.uso[k], 10) || 0));
  }
  if (m.spec && typeof m.spec === "object") {
    o.spec = {};
    for (const k of ["cil", "pot", "torque", "cambio", "tanque", "peso", "banco", "freio", "comb"]) o.spec[k] = txt(m.spec[k], 140);
    for (const k of ["potN", "tanqueN", "pesoN"]) { const n = num(m.spec[k]); if (n !== null) o.spec[k] = n; }
  }
  o.destaques = (Array.isArray(m.destaques) ? m.destaques : []).slice(0, 8).map(d => txt(d, 200)).filter(Boolean);
  return o;
}
function limpar(c) {
  const out = { v: 1, config: {}, motos: {} };
  const cf = (c && c.config) || {};
  const zap = String(cf.whatsapp || "").replace(/\D/g, "");
  if (zap === "" || (zap.length >= 10 && zap.length <= 15)) out.config.whatsapp = zap;
  if (/^[\w.]{1,30}$/.test(cf.instagram || "")) out.config.instagram = cf.instagram;
  if (cf.dataPrecos) out.config.dataPrecos = txt(cf.dataPrecos, 20);
  if (fotoOk(cf.brendaFoto)) out.config.brendaFoto = cf.brendaFoto;
  const ms = (c && c.motos) || {};
  for (const id of Object.keys(ms).slice(0, 60)) {
    if (!/^[a-z0-9-]{1,40}$/.test(id) || !ms[id] || typeof ms[id] !== "object") continue;
    out.motos[id] = limparMoto(id, ms[id]);
  }
  return out;
}

/* ---------- rotas ---------- */
function json(res, code, obj, cache) {
  res.setHeader("Cache-Control", cache || "no-store");
  res.status(code).json(obj);
}
async function lerConteudo() {
  try { const s = await redis(["GET", K.content]); return s ? JSON.parse(s) : {}; } catch (e) { return {}; }
}

module.exports = async function handler(req, res) {
  const a = String((req.query && req.query.a) || "");
  const body = req.body && typeof req.body === "object" ? req.body : {};
  try {
    if (a === "content") {
      const c = await lerConteudo();
      const admin = req.query.admin && tokenOk(req);
      return json(res, 200, c, admin ? "no-store" : "public, max-age=0, s-maxage=15, stale-while-revalidate=60");
    }

    if (a === "img") {
      const id = String(req.query.id || "");
      if (!/^[a-f0-9]{16}$/.test(id)) return json(res, 404, { erro: "não encontrada" });
      const v = await redis(["GET", "bh:img:" + id]);
      if (!v) return json(res, 404, { erro: "não encontrada" });
      const i = v.indexOf("|");
      res.setHeader("Content-Type", v.slice(0, i));
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.status(200).send(Buffer.from(v.slice(i + 1), "base64"));
    }

    if (a === "login" && req.method === "POST") {
      const ip = ipDe(req), key = "bh:rl:" + ip;
      try {
        const n = await redis(["INCR", key]);
        if (n === 1) await redis(["EXPIRE", key, 900]);
        if (n > 8) return json(res, 429, { erro: "Muitas tentativas. Tente de novo em 15 minutos." });
      } catch (e) { /* sem banco: segue só com o atraso abaixo */ }
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return json(res, 503, { erro: "O acesso do painel ainda não foi configurado no Vercel (ADMIN_EMAIL e ADMIN_PASSWORD)." });
      const okEmail = iguais(String(body.email || "").trim().toLowerCase(), ADMIN_EMAIL);
      const okSenha = senhaOk(body.senha || "");
      if (!(okEmail && okSenha)) { await espera(700); return json(res, 401, { erro: "E-mail ou senha inválidos." }); }
      try { await redis(["DEL", key]); } catch (e) { /* ok */ }
      return json(res, 200, { token: criarToken(), expira: Date.now() + TTL, banco: !!(REDIS_URL && REDIS_TOKEN) });
    }

    if (a === "check") return tokenOk(req) ? json(res, 200, { ok: true, banco: !!(REDIS_URL && REDIS_TOKEN) }) : json(res, 401, { erro: "sessão expirada" });

    if (!tokenOk(req)) return json(res, 401, { erro: "Sessão expirada. Entre de novo." });

    if (a === "save" && req.method === "POST") {
      const novo = limpar(body.content);
      const s = JSON.stringify(novo);
      if (s.length > 600000) return json(res, 413, { erro: "Conteúdo grande demais." });
      const atual = await redis(["GET", K.content]);
      if (atual) await redis(["SET", K.bak, atual]);
      await redis(["SET", K.content, s]);
      return json(res, 200, { ok: true, content: novo });
    }

    if (a === "undo" && req.method === "POST") {
      const bak = await redis(["GET", K.bak]);
      if (!bak) return json(res, 404, { erro: "Não há versão anterior." });
      const atual = await redis(["GET", K.content]);
      await redis(["SET", K.content, bak]);
      if (atual) await redis(["SET", K.bak, atual]);
      return json(res, 200, { ok: true, content: JSON.parse(bak) });
    }

    if (a === "upload" && req.method === "POST") {
      const m = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.data || ""));
      if (!m) return json(res, 400, { erro: "Imagem inválida (use JPG, PNG ou WebP)." });
      const buf = Buffer.from(m[2], "base64");
      if (buf.length > 1500000) return json(res, 413, { erro: "Imagem grande demais (máx. 1,5 MB)." });
      const h = buf.subarray(0, 12);
      const magic = (m[1] === "image/png" && h[0] === 0x89 && h[1] === 0x50) ||
        (m[1] === "image/jpeg" && h[0] === 0xff && h[1] === 0xd8) ||
        (m[1] === "image/webp" && h.toString("ascii", 0, 4) === "RIFF" && h.toString("ascii", 8, 12) === "WEBP");
      if (!magic) return json(res, 400, { erro: "Arquivo não parece uma imagem." });
      const id = crypto.randomBytes(8).toString("hex");
      await redis(["SET", "bh:img:" + id, m[1] + "|" + m[2]]);
      return json(res, 200, { url: "/api/site?a=img&id=" + id });
    }

    return json(res, 404, { erro: "rota desconhecida" });
  } catch (e) {
    if (e && e.code === "storage-off") return json(res, 503, { erro: "O banco de dados ainda não está ligado ao projeto no Vercel.", semBanco: true });
    return json(res, 500, { erro: "Erro no servidor. Tente de novo." });
  }
};
