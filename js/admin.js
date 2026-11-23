/* ==========================================================
   Painel da Janaína Honda — edição de motos, fotos, nomes e valores
   Fala com /api/site (login, salvar, enviar foto).
   ========================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const API = "/api/site";
  const KEY = "bh_admin";
  const LABEL = {
    cat: { dia: "Dia a dia", scooter: "Scooter", trail: "Trail", naked: "Naked", offroad: "Off-road" },
    camb: { semi: "Semiautomático", auto: "Automático", manual: "Manual" },
    tipo: { cub: "Cub (Pop / Biz)", scooter: "Scooter", street: "Street", trail: "Trail", scooter2: "Scooter grande (PCX / ADV)", adv: "Adventure", naked: "Naked" }
  };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const brl = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
  const clone = o => JSON.parse(JSON.stringify(o));
  let token = null, dirty = false, bancoOk = true;

  /* ---------- avisos ---------- */
  let tt;
  function aviso(msg, tipo) {
    const t = $("#toast"); t.textContent = msg; t.className = tipo || ""; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, tipo === "err" ? 6000 : 3200);
  }
  function sujo(v = true) {
    dirty = v;
    $("#btnSave").classList.toggle("dirty", v);
    $("#status").textContent = v ? "Alterações ainda não publicadas" : "Tudo publicado";
  }
  addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- servidor ---------- */
  async function api(a, opt = {}) {
    const r = await fetch(`${API}?a=${a}${opt.q || ""}`, {
      method: opt.body ? "POST" : "GET",
      headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined, cache: "no-store"
    });
    let j = {}; try { j = await r.json(); } catch (e) { /* sem corpo */ }
    if (r.status === 401 && a !== "login") { sair(); throw new Error("Sessão expirada. Entre de novo."); }
    if (!r.ok) throw Object.assign(new Error(j.erro || ("Erro " + r.status + ". Este painel só funciona no site publicado no Vercel.")), { semBanco: j.semBanco });
    return j;
  }
  const guardado = () => { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch (e) { return null; } };
  function sair() {
    token = null; try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch (e) { /* ok */ }
    $("#panelView").hidden = true; $("#loginView").hidden = false;
  }

  /* ---------- login ---------- */
  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("#errorMsg"), b = $("#btnLogin"); err.style.display = "none"; b.disabled = true; b.textContent = "Entrando…";
    try {
      const j = await api("login", { body: { email: $("#email").value, senha: $("#password").value } });
      token = j.token; bancoOk = j.banco;
      try { (($("#lembrar").checked ? localStorage : sessionStorage)).setItem(KEY, token); } catch (x) { /* ok */ }
      $("#password").value = "";
      await entrar();
    } catch (x) { err.textContent = x.message; err.style.display = "block"; }
    b.disabled = false; b.textContent = "Entrar";
  });
  $("#btnOut").addEventListener("click", () => { if (!dirty || confirm("Há alterações sem publicar. Sair mesmo assim?")) { sujo(false); sair(); } });

  /* ---------- dados ---------- */
  function carregar(c) {
    MOTOS.splice(0, MOTOS.length, ...clone(MOTOS_PADRAO));
    Object.keys(CONFIG).forEach(k => delete CONFIG[k]); Object.assign(CONFIG, clone(CONFIG_PADRAO));
    aplicarConteudo(c, { mostrarOcultas: true });
  }
  const padraoDe = m => MOTOS_PADRAO.find(x => x.id === m.id);
  const editada = m => { const p = padraoDe(m); return p && JSON.stringify(m) !== JSON.stringify(p); };
  const fmtZap = d => { d = String(d || "").replace(/\D/g, ""); if (d.startsWith("55") && d.length > 11) d = d.slice(2); return d.length > 7 ? `${d.slice(0, 2)} ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d; };

  async function entrar() {
    const chk = await api("check");
    bancoOk = chk.banco !== false && bancoOk;
    carregar(await api("content", { q: "&admin=1" }));
    $("#loginView").hidden = true; $("#panelView").hidden = false;
    const w = $("#semBanco");
    w.hidden = bancoOk;
    if (!bancoOk) w.textContent = "O armazenamento (Vercel Blob) ainda não está ligado a este projeto no Vercel, então não dá para publicar alterações. No Vercel: projeto → Storage → criar um Blob (público) → conectar ao projeto → publicar o site de novo.";
    pintarGeral(); desenharLista(); sujo(false);
  }

  /* ---------- geral ---------- */
  function pintarGeral() {
    $("#gZap").value = fmtZap(CONFIG.whatsapp); $("#gIg").value = CONFIG.instagram || ""; $("#gDt").value = CONFIG.dataPrecos || "";
    $("#gFoto").src = CONFIG.brendaFoto || "assets/janaina.webp";
  }
  document.addEventListener("input", e => {
    const k = e.target.dataset && e.target.dataset.cfg; if (!k) return;
    let v = e.target.value;
    if (k === "whatsapp") { const d = v.replace(/\D/g, ""); v = !d ? "" : (d.startsWith("55") && d.length > 11 ? d : "55" + d); }
    if (k === "instagram") v = v.replace(/^@/, "").replace(/[^\w.]/g, "");
    CONFIG[k] = v; sujo();
  });
  $("#gTrocar").addEventListener("click", () => pedirFoto(1400, url => { CONFIG.brendaFoto = url; $("#gFoto").src = url; }));
  $("#gOrig").addEventListener("click", () => { delete CONFIG.brendaFoto; $("#gFoto").src = "assets/janaina.webp"; sujo(); });

  /* ---------- foto: reduz no aparelho e envia ---------- */
  async function preparar(file, lado) {
    const url = URL.createObjectURL(file);
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("Não consegui abrir essa imagem.")); i.src = url; });
    const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const blob = (c, t, q) => new Promise(r => c.toBlob(r, t, q));
    let b = await blob(cv, "image/webp", .86);
    if (!b || b.type !== "image/webp") {
      b = await blob(cv, "image/png");
      if (!b || b.size > 1200000) {
        const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
        const x = c2.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(cv, 0, 0);
        b = await blob(c2, "image/jpeg", .88);
      }
    }
    if (!b || b.size > 1400000) throw new Error("A foto ficou pesada demais. Tente uma menor.");
    return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
  }
  function pedirFoto(lado, cb) {
    const inp = $("#arq"); inp.value = "";
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        aviso("Enviando a foto…");
        const j = await api("upload", { body: { data: await preparar(f, lado) } });
        cb(j.url); sujo(); aviso("Foto enviada. Toque em “Publicar alterações” para ela aparecer para os clientes.", "ok");
      } catch (x) { aviso(x.message, "err"); }
    };
    inp.click();
  }

  /* ---------- lista de motos ---------- */
  const campo = (rot, p, v, extra = "") => `<div class="f ${extra}"><label>${rot}</label><input data-p="${p}" value="${esc(v)}"></div>`;
  const seletor = (rot, p, v, opcoes) => `<div class="f"><label>${rot}</label><select data-p="${p}">${Object.entries(opcoes).map(([k, n]) => `<option value="${k}"${k === v ? " selected" : ""}>${n}</option>`).join("")}</select></div>`;
  function blocoCor(c, ci, m) {
    const fotos = c.fotos || [];
    return `<div class="cor">
      <div class="head">
        <div class="f"><label>Nome da cor</label><input data-p="cores.${ci}.n" value="${esc(c.n)}"></div>
        <div class="f" style="flex:0 0 auto"><label>Tom</label><input type="color" data-p="cores.${ci}.h" value="${esc(c.h)}"></div>
        <button class="mini red" type="button" data-act="del-cor" data-c="${ci}"${m.cores.length < 2 ? " disabled" : ""}>Remover</button>
      </div>
      <div class="fotos">
        ${fotos.map((u, k) => `<div class="foto pic" data-act="rep-foto" data-c="${ci}" data-k="${k}" title="Toque para trocar"><img src="${esc(u)}" alt=""><button class="x" type="button" data-act="del-foto" data-c="${ci}" data-k="${k}" aria-label="Remover foto">×</button></div>`).join("")}
        <div class="foto add" data-act="add-foto" data-c="${ci}">+ foto</div>
      </div>
      ${fotos.length ? "" : `<p class="hint" style="margin:8px 0 0">Sem foto: o site mostra uma ilustração desenhada desta moto.</p>`}
    </div>`;
  }
  function corpo(m) {
    const s = m.spec || {};
    const specs = [["Cilindrada", "cil"], ["Potência", "pot"], ["Torque", "torque"], ["Câmbio", "cambio"], ["Tanque", "tanque"], ["Peso", "peso"], ["Altura do banco", "banco"], ["Freios", "freio"], ["Combustível", "comb"]];
    return `<div class="mbody">
      <div class="grid" style="margin-top:14px">
        ${campo("Nome da moto", "nome", m.nome)}
        ${seletor("Categoria", "cat", m.cat, LABEL.cat)}
        ${seletor("Câmbio", "camb", m.camb, LABEL.camb)}
        ${campo("Frase de destaque (abaixo do nome)", "tag", m.tag, "full")}
      </div>
      <h3>Versões e valores</h3>
      <p class="hint">O menor valor aparece como “a partir de”. Versão sem valor aparece como “consulte”.</p>
      ${m.versoes.map((v, k) => `<div class="row">
        <div class="f"><label>Versão</label><input data-p="versoes.${k}.n" value="${esc(v.n)}"></div>
        <div class="f pr"><label>Valor (R$)</label><input inputmode="numeric" data-num data-p="versoes.${k}.p" value="${v.p == null ? "" : v.p}"></div>
        <button class="mini red" type="button" data-act="del-ver" data-k="${k}"${m.versoes.length < 2 ? " disabled" : ""}>✕</button></div>`).join("")}
      <button class="mini" type="button" data-act="add-ver">+ Versão</button>
      <h3>Cores e fotos</h3>
      <p class="hint">A 1ª foto de cada cor é a lateral da moto (aparece no card). As outras viram “outros ângulos”. Fotos de lado, com fundo transparente, ficam melhores.</p>
      ${m.cores.map((c, ci) => blocoCor(c, ci, m)).join("")}
      <button class="mini" type="button" data-act="add-cor">+ Cor</button>
      <h3>Ficha técnica</h3>
      <div class="grid">${specs.map(([l, k]) => campo(l, "spec." + k, s[k])).join("")}</div>
      <h3>Destaques</h3>
      <div class="f"><label>Um por linha</label><textarea data-p="destaques" data-lines>${esc((m.destaques || []).join("\n"))}</textarea></div>
      <div class="acts">
        <button class="mini" type="button" data-act="ocultar">${m.oculta ? "Mostrar no site" : "Ocultar do site"}</button>
        ${editada(m) ? `<button class="mini" type="button" data-act="restaurar">Restaurar original</button>` : ""}
        ${m.custom ? `<button class="mini red" type="button" data-act="excluir">Excluir moto</button>` : ""}
      </div>
    </div>`;
  }
  function resumo(m) {
    const f = m.cores[0] && m.cores[0].fotos && m.cores[0].fotos[0];
    const pr = m.versoes.map(v => v.p).filter(Boolean);
    const th = f ? `<img src="${esc(f)}" alt="">` : `<span style="width:22px;height:22px;border-radius:50%;background:${esc(m.cores[0] ? m.cores[0].h : "#ccc")}"></span>`;
    return `<div class="th">${th}</div>
      <div class="nm"><b>${esc(m.nome)}${m.oculta ? '<span class="tag of">oculta</span>' : ""}${m.custom ? '<span class="tag nv">nova</span>' : editada(m) ? '<span class="tag ed">editada</span>' : ""}</b>
      <span>${pr.length ? "a partir de " + brl(Math.min(...pr)) : "sem valor"} · ${m.cores.length} cor${m.cores.length > 1 ? "es" : ""}</span></div><span class="chev">›</span>`;
  }
  function desenharLista(abertas = []) {
    $("#lista").innerHTML = MOTOS.map((m, i) => `<details class="moto" data-i="${i}"${abertas.includes(m.id) ? " open" : ""}><summary>${resumo(m)}</summary>${abertas.includes(m.id) ? corpo(m) : ""}</details>`).join("");
  }
  const abertas = () => [...document.querySelectorAll("details.moto[open]")].map(d => MOTOS[+d.dataset.i].id);
  function refazer(det) {
    const m = MOTOS[+det.dataset.i];
    det.querySelector("summary").innerHTML = resumo(m);
    const old = det.querySelector(".mbody"); if (old) old.outerHTML = corpo(m);
  }
  $("#lista").addEventListener("toggle", e => {
    const d = e.target; if (!d.matches || !d.matches("details.moto")) return;
    if (d.open && !d.querySelector(".mbody")) d.insertAdjacentHTML("beforeend", corpo(MOTOS[+d.dataset.i]));
  }, true);

  /* ---------- edição ---------- */
  function setPath(o, p, v) { const ks = p.split("."); let t = o; for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]]; t[ks[ks.length - 1]] = v; }
  function aoEditar(e) {
    const el = e.target, p = el.dataset && el.dataset.p; if (!p) return;
    const det = el.closest("details.moto"); if (!det) return;
    const m = MOTOS[+det.dataset.i];
    let v = el.value;
    if (el.hasAttribute("data-num")) { v = v.replace(/\D/g, ""); if (v !== el.value) el.value = v; v = v === "" ? null : Number(v); }
    if (el.hasAttribute("data-lines")) v = v.split("\n").map(x => x.trim()).filter(Boolean);
    setPath(m, p, v); sujo();
    if (p === "nome" || p.startsWith("versoes.") || p.endsWith(".h")) det.querySelector("summary").innerHTML = resumo(m);
  }
  $("#lista").addEventListener("input", aoEditar);
  $("#lista").addEventListener("change", aoEditar);

  $("#lista").addEventListener("click", e => {
    const a = e.target.closest("[data-act]"); if (!a) return;
    const det = a.closest("details.moto"), m = MOTOS[+det.dataset.i];
    const c = +a.dataset.c, k = +a.dataset.k;
    switch (a.dataset.act) {
      case "add-ver": m.versoes.push({ n: "", p: null }); break;
      case "del-ver": m.versoes.splice(k, 1); break;
      case "add-cor": m.cores.push({ n: "Nova cor", h: "#9aa0ab", fotos: [] }); break;
      case "del-cor": if (!confirm("Remover esta cor?")) return; m.cores.splice(c, 1); break;
      case "del-foto": m.cores[c].fotos.splice(k, 1); if (m.cores[c].legendas) m.cores[c].legendas.splice(k, 1); break;
      case "add-foto": pedirFoto(1200, url => { (m.cores[c].fotos = m.cores[c].fotos || []).push(url); refazer(det); }); return;
      case "rep-foto": pedirFoto(1200, url => { m.cores[c].fotos[k] = url; refazer(det); }); return;
      case "ocultar": if (m.oculta) delete m.oculta; else m.oculta = true; break;
      case "restaurar":
        if (!confirm("Voltar esta moto para os dados originais? As suas edições nela serão perdidas.")) return;
        MOTOS[+det.dataset.i] = clone(padraoDe(m)); break;
      case "excluir":
        if (!confirm("Excluir esta moto de vez?")) return;
        MOTOS.splice(+det.dataset.i, 1); sujo(); desenharLista(abertas().filter(id => id !== m.id)); return;
    }
    sujo(); refazer(det);
  });

  $("#btnNova").addEventListener("click", () => {
    const id = "nova-" + Date.now().toString(36);
    MOTOS.push({
      id, custom: true, semQuiz: true, nome: "Nova moto", cat: "dia", tipo: "cub", camb: "manual", tag: "",
      versoes: [{ n: "Versão única", p: null }], cores: [{ n: "Cor", h: "#d6001c", fotos: [] }],
      uso: { trabalho: 1, cidade: 1, estrada: 1, lazer: 1 },
      spec: { cil: "", pot: "", potN: 0, torque: "", cambio: "", tanque: "", tanqueN: 0, peso: "", pesoN: 0, banco: "", freio: "", comb: "" },
      destaques: []
    });
    sujo(); desenharLista([...abertas(), id]);
    const d = $("#lista").lastElementChild; d.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- publicar ---------- */
  function montar() {
    const config = { whatsapp: CONFIG.whatsapp, instagram: CONFIG.instagram, dataPrecos: CONFIG.dataPrecos };
    if (CONFIG.brendaFoto) config.brendaFoto = CONFIG.brendaFoto;
    const motos = {};
    MOTOS.forEach(m => { const p = padraoDe(m); if (!p || JSON.stringify(m) !== JSON.stringify(p)) motos[m.id] = m; });
    return { config, motos };
  }
  function validar() {
    const z = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    if (z && (z.length < 12 || z.length > 13)) { window.scrollTo({ top: 0, behavior: "smooth" }); throw new Error("WhatsApp incompleto: coloque o DDD e o número (ex.: 81 99999-9999)."); }
    for (let i = 0; i < MOTOS.length; i++) {
      const m = MOTOS[i], det = $(`details.moto[data-i="${i}"]`);
      m.nome = (m.nome || "").trim();
      if (!m.custom && !editada(m)) continue;
      m.versoes = m.versoes.filter(v => v.n || v.p).map(v => ({ n: (v.n || "").trim() || m.nome, p: v.p }));
      const falta = msg => { if (det) { det.open = true; det.scrollIntoView({ behavior: "smooth", block: "start" }); } throw new Error(`${m.nome || "Moto sem nome"}: ${msg}`); };
      if (!m.nome) falta("coloque o nome.");
      if (!m.versoes.some(v => v.p > 0)) falta("coloque o valor de pelo menos uma versão.");
      if (!m.cores.length) falta("deixe pelo menos uma cor.");
      if (m.custom) for (const [k, n] of [["cil", "cilindrada"], ["pot", "potência"], ["tanque", "tanque"], ["peso", "peso"]]) if (!/\d/.test(m.spec[k] || "")) falta(`preencha ${n} na ficha técnica (com números).`);
    }
  }
  $("#btnSave").addEventListener("click", async () => {
    const b = $("#btnSave");
    try {
      validar();
      b.disabled = true; b.textContent = "Publicando…";
      const ab = abertas();
      const j = await api("save", { body: { content: montar() } });
      carregar(j.content); pintarGeral(); desenharLista(ab); sujo(false);
      aviso("Publicado! O site dos clientes já mostra as mudanças (leva uns 10 segundos).", "ok");
    } catch (x) { aviso(x.message, "err"); }
    b.disabled = false; b.textContent = "Publicar alterações";
  });
  $("#btnUndo").addEventListener("click", async () => {
    if (!confirm("Voltar o site para a publicação anterior?")) return;
    try {
      const ab = abertas(); const j = await api("undo", { body: {} });
      carregar(j.content); pintarGeral(); desenharLista(ab); sujo(false); aviso("Voltou para a publicação anterior.", "ok");
    } catch (x) { aviso(x.message, "err"); }
  });

  /* ---------- início ---------- */
  (async () => {
    const t = guardado();
    if (t) { token = t; try { await entrar(); return; } catch (x) { token = null; } }
    $("#loginView").hidden = false;
  })();
})();
