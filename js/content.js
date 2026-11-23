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

  window.aplicarConteudo = function (c, opt) {
    opt = opt || {};
    if (!c || typeof c !== "object") return;
    const cf = c.config || {};
    ["whatsapp", "instagram", "dataPrecos"].forEach(k => { if (k in cf) CONFIG[k] = cf[k]; });
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
    if (CONFIG.brendaFoto) document.querySelectorAll("img[data-brenda]").forEach(im => { im.src = CONFIG.brendaFoto; im.classList.remove("moldura"); }); // foto trocada no painel: sem moldura (serve para recorte com fundo transparente)
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
    .then(c => { if (!ligou) { try { aplicarConteudo(c); } catch (e) { console.error(e); } } })
    .catch(() => {})
    .finally(() => { clearTimeout(t); ligar(); });
})();
