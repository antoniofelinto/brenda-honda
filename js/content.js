/* ------------------------------------------------------------------
   Conteúdo editável pelo painel (/admin.html).
   Junta as edições salvas no servidor aos dados originais de data.js.
   Se o servidor não responder, o site abre normal com os dados originais.
------------------------------------------------------------------- */
(() => {
  const PADRAO = JSON.parse(JSON.stringify(MOTOS));
  window.MOTOS_PADRAO = PADRAO;
  window.CONFIG_PADRAO = JSON.parse(JSON.stringify(CONFIG));
  const numDe = s => { const m = /\d+(?:,\d+)?/.exec(String(s || "")); return m ? parseFloat(m[0].replace(",", ".")) : null; };
  const SPEC0 = { cil: "0 cm³", pot: "", potN: 0, torque: "", cambio: "", tanque: "", tanqueN: 0, peso: "", pesoN: 0, banco: "", freio: "", comb: "" };

  /* texto do topo do site (título, parágrafo e botões). No painel só o
     CONFIG.hero é atualizado: a página do site (elementos [data-hero]) não existe lá. */
  window.aplicarHero = function (h) {
    if (h && typeof h === "object") CONFIG.hero = Object.assign({}, CONFIG.hero, h);
    if (window.__ADMIN__) return;
    const hr = CONFIG.hero || {};
    document.querySelectorAll("[data-hero]").forEach(el => {
      const k = el.dataset.hero, v = hr[k];
      if (typeof v !== "string") return;
      el.textContent = v;
      if (/^l[123]$/.test(k)) {
        const ln = el.parentElement;
        ln.style.display = v ? "" : "none";          // linha em branco some
        ln.classList.toggle("wrap", v.length > 11);  // linha longa quebra (o padrão mais comprido tem 11)
      }
    });
  };

  /* texto do rodapé (nome, texto ao lado e aviso). No painel só o CONFIG.rodape é
     atualizado: o rodapé do site (elementos [data-rodape]) não existe lá. */
  window.aplicarRodape = function (r) {
    if (r && typeof r === "object") CONFIG.rodape = Object.assign({}, CONFIG.rodape, r);
    if (window.__ADMIN__) return;
    const rd = CONFIG.rodape || {};
    document.querySelectorAll("[data-rodape]").forEach(el => {
      const k = el.dataset.rodape, v = rd[k];
      if (typeof v !== "string") return;
      el.textContent = k === "cargo" && v ? ", " + v : v; // o texto ao lado entra depois de uma vírgula
    });
  };

  window.aplicarConteudo = function (c, opt) {
    opt = opt || {};
    if (!c || typeof c !== "object") return;
    const cf = c.config || {};
    ["whatsapp", "instagram", "dataPrecos"].forEach(k => { if (k in cf) CONFIG[k] = cf[k]; });
    if (cf.hero) aplicarHero(cf.hero);
    if (cf.rodape) aplicarRodape(cf.rodape);
    if (cf.brendaFoto) CONFIG.brendaFoto = cf.brendaFoto;
    const ed = c.motos || {};
    Object.keys(ed).forEach(id => {
      const e = ed[id], i = MOTOS.findIndex(m => m.id === id);
      if (i >= 0) {
        const base = MOTOS[i], n = Object.assign({}, base, e, { id });
        n.spec = Object.assign({}, base.spec, e.spec || {});
        if (!(e.versoes && e.versoes.length)) n.versoes = base.versoes;
        if (!(e.cores && e.cores.length)) n.cores = base.cores;
        if (!e.oculta) delete n.oculta;
        MOTOS[i] = n;
      } else if (e.custom && e.versoes && e.versoes.length && e.cores && e.cores.length) {
        MOTOS.push(Object.assign({ tipo: "cub", camb: "manual", cat: "dia", semQuiz: true, uso: { trabalho: 1, cidade: 1, estrada: 1, lazer: 1 } }, e,
          { id, spec: Object.assign({}, SPEC0, e.spec || {}) }));
      }
    });
    MOTOS.forEach(m => {
      const o = PADRAO.find(x => x.id === m.id), s = m.spec;
      [["pot", "potN"], ["tanque", "tanqueN"], ["peso", "pesoN"]].forEach(([t, n]) => {
        if (!o || o.spec[t] !== s[t] || typeof s[n] !== "number") { const v = numDe(s[t]); if (v != null) s[n] = v; }
      });
      if (!/\d/.test(s.cil)) s.cil = "0 cm³";
    });
    if (!opt.mostrarOcultas) for (let i = MOTOS.length - 1; i >= 0; i--) if (MOTOS[i].oculta) MOTOS.splice(i, 1);
    if (CONFIG.brendaFoto) document.querySelectorAll("img[data-brenda]").forEach(im => { im.src = CONFIG.brendaFoto; });
  };

  if (window.__ADMIN__) return;
  /* site público: busca as edições e só então liga a página */
  let ligou = false;
  const ligar = () => {
    if (ligou) return; ligou = true;
    const s = document.createElement("script"); s.src = "js/app.js"; document.body.appendChild(s);
  };
  const t = setTimeout(ligar, 2200);
  fetch("/api/site?a=content", { cache: "no-cache" })
    .then(r => (r.ok ? r.json() : {}))
    .then(c => {
      try {
        if (!ligou) aplicarConteudo(c);
        else if (c && c.config) { // chegou tarde: troca só os textos do topo e do rodapé
          if (c.config.hero) aplicarHero(c.config.hero);
          if (c.config.rodape) aplicarRodape(c.config.rodape);
        }
      } catch (e) { console.error(e); }
    })
    .catch(() => {})
    .finally(() => { clearTimeout(t); ligar(); });
})();
