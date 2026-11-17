"use strict";
/* ------------------------------------------------------------------
   API única do site (Vercel Function): conteúdo editável + painel.
   Rotas (todas em /api/site?a=...):
     content  GET   conteúdo editado, lido pelo site público
     login    POST  { email, senha } -> token de 12 h
     check    GET   confere se o token ainda vale
     save     POST  { content }       (precisa do token)
     upload   POST  { data }          (precisa do token) imagem em dataURL
     undo     POST  desfaz a última publicação (precisa do token)

   Onde ficam os dados: Vercel Blob (armazenamento do projeto no Vercel).
   Variável lida: BLOB_READ_WRITE_TOKEN (entra sozinha ao criar o Blob no projeto).
   Obrigatórias: ADMIN_EMAIL e ADMIN_PASSWORD (acesso do painel; ficam só no Vercel,
                 nunca no código). Opcional: SESSION_SECRET.
------------------------------------------------------------------- */
const crypto = require("crypto");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""; // definida no Vercel (Settings > Environment Variables)
const BLOB_ON = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const SECRET = process.env.SESSION_SECRET ||
  crypto.createHash("sha256").update("bh-session|" + ADMIN_EMAIL + "|" + ADMIN_PASSWORD).digest("hex");
const TTL = 12 * 3600 * 1000;
const P = { content: "bh/content.json", bak: "bh/content.bak.json" };
const IMG_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/bh\/img\/[a-f0-9]{16}\.(webp|png|jpg)$/;

/* ---------- armazenamento (Vercel Blob) ---------- */
async function blobLib() {
  if (!BLOB_ON()) { const e = new Error("storage-off"); e.code = "storage-off"; throw e; }
  return import("@vercel/blob");
}
async function lerTexto(path) {
  const { list } = await blobLib();
  const r = await list({ prefix: path, limit: 5 });
  const b = r.blobs.find(x => x.pathname === path);
  if (!b) return null;
  const v = new Date(b.uploadedAt).getTime(); // muda a cada gravação: nunca vem do cache velho
  const res = await fetch(b.url + (b.url.includes("?") ? "&" : "?") + "v=" + v, { cache: "no-store" });
  if (!res.ok) throw new Error("blob " + res.status);
  return res.text();
}
async function gravarTexto(path, texto) {
  const { put } = await blobLib();
  await put(path, texto, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
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
const falhas = new Map(); // ip -> { n, ate }  (por instância da função)
const bloqueado = ip => { const f = falhas.get(ip); return !!(f && f.ate > Date.now() && f.n >= 8); };
const falhou = ip => { const t = Date.now(), f = falhas.get(ip); if (!f || f.ate <= t) falhas.set(ip, { n: 1, ate: t + 900000 }); else f.n++; };

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
/* texto do topo do site: título (3 linhas), parágrafo e 2 botões */
const HERO_MAX = { l1: 30, l2: 30, l3: 30, texto: 300, btn1: 30, btn2: 30 };
const HERO_LINHAS = ["l1", "l2", "l3"];
function limparHero(h) {
  const out = {};
  if (!h || typeof h !== "object") return out;
  for (const k of HERO_LINHAS) if (typeof h[k] === "string") out[k] = txt(h[k], HERO_MAX[k]); // linha pode ficar em branco
  for (const k of ["texto", "btn1", "btn2"]) if (typeof h[k] === "string") { const v = txt(h[k], HERO_MAX[k]); if (v) out[k] = v; }
  if (HERO_LINHAS.every(k => out[k] === "")) HERO_LINHAS.forEach(k => delete out[k]); // título não pode ficar sem nenhuma linha
  return out;
}
function limpar(c) {
  const out = { v: 1, config: {}, motos: {} };
  const cf = (c && c.config) || {};
  const zap = String(cf.whatsapp || "").replace(/\D/g, "");
  if (zap === "" || (zap.length >= 10 && zap.length <= 15)) out.config.whatsapp = zap;
  if (/^[\w.]{1,30}$/.test(cf.instagram || "")) out.config.instagram = cf.instagram;
  if (cf.dataPrecos) out.config.dataPrecos = txt(cf.dataPrecos, 20);
  if (fotoOk(cf.brendaFoto)) out.config.brendaFoto = cf.brendaFoto;
  const hero = limparHero(cf.hero);
  if (Object.keys(hero).length) out.config.hero = hero;
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
  try { const s = await lerTexto(P.content); return s ? JSON.parse(s) : {}; } catch (e) { return {}; }
}

module.exports = async function handler(req, res) {
  const a = String((req.query && req.query.a) || "");
  const body = req.body && typeof req.body === "object" ? req.body : {};
  try {
    if (a === "content") {
      const c = await lerConteudo();
      const admin = req.query.admin && tokenOk(req);
      return json(res, 200, c, admin ? "no-store" : "public, max-age=0, s-maxage=10");
    }

    if (a === "login" && req.method === "POST") {
      const ip = ipDe(req);
      if (bloqueado(ip)) return json(res, 429, { erro: "Muitas tentativas. Tente de novo em 15 minutos." });
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return json(res, 503, { erro: "O acesso do painel ainda não foi configurado no Vercel (ADMIN_EMAIL e ADMIN_PASSWORD)." });
      const okEmail = iguais(String(body.email || "").trim().toLowerCase(), ADMIN_EMAIL);
      const okSenha = senhaOk(body.senha || "");
      if (!(okEmail && okSenha)) { falhou(ip); await espera(700); return json(res, 401, { erro: "E-mail ou senha inválidos." }); }
      falhas.delete(ip);
      return json(res, 200, { token: criarToken(), expira: Date.now() + TTL, banco: BLOB_ON() });
    }

    if (a === "check") return tokenOk(req) ? json(res, 200, { ok: true, banco: BLOB_ON() }) : json(res, 401, { erro: "sessão expirada" });

    if (!tokenOk(req)) return json(res, 401, { erro: "Sessão expirada. Entre de novo." });

    if (a === "save" && req.method === "POST") {
      const novo = limpar(body.content);
      const s = JSON.stringify(novo);
      if (s.length > 600000) return json(res, 413, { erro: "Conteúdo grande demais." });
      const atual = await lerTexto(P.content);
      if (atual) await gravarTexto(P.bak, atual);
      await gravarTexto(P.content, s);
      return json(res, 200, { ok: true, content: novo });
    }

    if (a === "undo" && req.method === "POST") {
      const bak = await lerTexto(P.bak);
      if (!bak) return json(res, 404, { erro: "Não há versão anterior." });
      const atual = await lerTexto(P.content);
      await gravarTexto(P.content, bak);
      if (atual) await gravarTexto(P.bak, atual);
      return json(res, 200, { ok: true, content: JSON.parse(bak) });
    }

    if (a === "upload" && req.method === "POST") {
      const m = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.data || ""));
      if (!m) return json(res, 400, { erro: "Imagem inválida (use JPG, PNG ou WebP)." });
      const buf = Buffer.from(m[2], "base64");
      if (buf.length > 2500000) return json(res, 413, { erro: "Imagem grande demais (máx. 2,5 MB)." });
      const h = buf.subarray(0, 12);
      const magic = (m[1] === "image/png" && h[0] === 0x89 && h[1] === 0x50) ||
        (m[1] === "image/jpeg" && h[0] === 0xff && h[1] === 0xd8) ||
        (m[1] === "image/webp" && h.toString("ascii", 0, 4) === "RIFF" && h.toString("ascii", 8, 12) === "WEBP");
      if (!magic) return json(res, 400, { erro: "Arquivo não parece uma imagem." });
      const id = crypto.randomBytes(8).toString("hex");
      const ext = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" }[m[1]];
      const { put } = await blobLib();
      const r = await put("bh/img/" + id + "." + ext, buf, { access: "public", addRandomSuffix: false, contentType: m[1], cacheControlMaxAge: 31536000 });
      return json(res, 200, { url: r.url });
    }

    return json(res, 404, { erro: "rota desconhecida" });
  } catch (e) {
    if (e && e.code === "storage-off") return json(res, 503, { erro: "O armazenamento (Vercel Blob) ainda não está ligado ao projeto no Vercel.", semBanco: true });
    return json(res, 500, { erro: "Erro no servidor. Tente de novo." });
  }
};
