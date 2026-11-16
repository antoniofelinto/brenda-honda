/* ==========================================================
   Brenda Honda — comportamento da página
   ========================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const brl = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
  const up = s => s.toUpperCase().replace(/(\d)I\b/g, "$1i");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- dados derivados ---------- */
  MOTOS.forEach(m => {
    const precos = m.versoes.map(v => v.p).filter(Boolean);
    m.n = {
      cil: parseFloat(m.spec.cil.replace(",", ".")),
      pot: m.spec.potN, tanque: m.spec.tanqueN, peso: m.spec.pesoN,
      pmin: Math.min(...precos)
    };
  });
  const MAX = {
    cil: Math.max(...MOTOS.map(m => m.n.cil)), pot: Math.max(...MOTOS.map(m => m.n.pot)),
    tanque: Math.max(...MOTOS.map(m => m.n.tanque)), peso: Math.max(...MOTOS.map(m => m.n.peso))
  };
  const BADGES = { cg: "Mais vendida do Brasil", cb1000: "Topo de linha", crf300f: "Só fora de estrada" };
  const byId = id => MOTOS.find(m => m.id === id);
  const state = { cat: "todas", sort: "destaque", cmp: [], cor: {} };
  const corDe = m => m.cores[state.cor[m.id] || 0];
  /* foto da cor (ou, sem foto, a ilustração desenhada) */
  function visual(m, c, label, i = 0) {
    const src = c.fotos && (c.fotos[i] || c.fotos[0]);
    if (src) return `<img class="foto" src="${esc(src)}" alt="${esc(label)}" decoding="async" draggable="false">`;
    return bike(m.tipo, c.h, { label: `${label} (ilustração)` });
  }
  const angulos = (m, c) => {
    if (!(c.fotos && c.fotos.length > 1)) return "";
    const leg = c.legendas || [];
    return `<div class="angles" role="group" aria-label="Fotos da moto">${c.fotos.map((f, i) => `<button type="button" class="ang${leg[i] ? " leg" : ""}" data-ang="${i}" aria-pressed="${i === 0}" aria-label="${leg[i] ? "Ver a " + esc(leg[i]) : `Ver foto ${i + 1} de ${c.fotos.length}`}"><img src="${esc(f)}" alt="" decoding="async">${leg[i] ? `<small>${esc(leg[i])}</small>` : ""}</button>`).join("")}</div>`;
  };
  /* troca de cor: a moto atual sai pela direita e a nova entra pela esquerda */
  const semMovimento = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function trocarMoto(box, html) {
    clearTimeout(box._tm); clearTimeout(box._te);
    box.classList.remove("swap", "go", "enter", "leave");
    const entra = () => {
      box.classList.remove("leave");
      box.innerHTML = html;
      void box.offsetWidth;
      box.classList.add("enter");
      box._te = setTimeout(() => box.classList.remove("enter"), 1200);
    };
    if (!box.firstElementChild || semMovimento()) { box.innerHTML = html; return; }
    void box.offsetWidth;
    box.classList.add("leave");
    box._tm = setTimeout(entra, 240);
  }

  /* ---------- WhatsApp / Instagram ---------- */
  const temZap = () => (CONFIG.whatsapp || "").replace(/\D/g, "").length >= 10;
  function waLink(text) {
    const n = (CONFIG.whatsapp || "").replace(/\D/g, "");
    if (n.length >= 10) return `https://wa.me/${n.startsWith("55") ? n : "55" + n}?text=${encodeURIComponent(text)}`;
    return `https://www.instagram.com/${CONFIG.instagram}/`;
  }
  function bindWa(scope = document) {
    $$("[data-wa]", scope).forEach(a => {
      a.href = waLink(a.dataset.wa);
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  /* ---------- peças do hero ---------- */
  (function buildWheel() {
    let t = "", s = "";
    for (let i = 0; i < 60; i++) t += `<line x1="0" y1="-186" x2="0" y2="-200" transform="rotate(${i * 6})"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M-19 -58 C-14 -100 -12 -126 -8 -152 L8 -152 C12 -126 14 -100 19 -58 Z" transform="rotate(${i * 72})"/>`;
    $("#tread").innerHTML = t; $("#spokes").innerHTML = s;
  })();

  const wheelIcon = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10" fill="none" stroke="currentColor" stroke-width="3"/><circle r="2.6" fill="currentColor"/>${[0, 72, 144, 216, 288].map(a => `<line y1="-3" y2="-9" stroke="currentColor" stroke-width="2" transform="rotate(${a})"/>`).join("")}</svg>`;
  const mq = $("#mq");
  const setHTML = `<div class="mq-set">${MOTOS.map(m => `<span>${esc(up(m.nome))}</span>${wheelIcon}`).join("")}</div>`;
  mq.innerHTML = setHTML + setHTML + setHTML;

  /* título do hero: encolhe se a fonte for mais larga que a coluna */
  function fitH1() {
    const h = $(".hero h1"); h.style.fontSize = "";
    const avail = h.parentElement.clientWidth;
    const w = Math.max(...$$(".ln > span", h).map(n => n.scrollWidth));
    if (w > avail) h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * avail / w * .98) + "px";
  }
  fitH1();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitH1);
  addEventListener("resize", fitH1);

  /* ---------- abertura ---------- */
  function fitText(el, max) {
    el.style.fontSize = "";
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const w = el.scrollWidth;
    if (w > max) el.style.fontSize = (fs * max / w) + "px";
  }
  function runIntro() {
    const intro = $("#intro");
    const reveal = () => { document.body.classList.add("go"); };
    if (!root.classList.contains("intro-on")) { reveal(); return; }
    const done = () => { root.classList.remove("intro-on"); intro.style.display = "none"; };
    try {
      const bikeEl = $(".intro-bike"), title = $(".intro-title"), lines = $$(".intro-speed i");
      bikeEl.innerHTML = bike("naked", "#d6001c", { label: "" });
      bikeEl.firstElementChild.setAttribute("aria-hidden", "true");
      const W = innerWidth;
      fitText(title, W * 0.9);
      const tr = title.getBoundingClientRect();
      const bw = bikeEl.offsetWidth, sc = bw / 360, rpx = 50 * sc;
      const wheels = $$(".wheel", bikeEl);
      const D = 2300;
      let raf = 0, t0 = 0, skipped = false, ended = false;

      const place = p => {
        const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const x = -bw * 1.1 + e * (W + bw * 1.35);
        const lift = -9 * Math.sin(Math.PI * clamp((p - .03) / .3, 0, 1));
        bikeEl.style.transform = `translate3d(${x}px,-97%,0) rotate(${lift}deg)`;
        const rot = (x / rpx) * 57.3;
        wheels.forEach(w => { w.style.transform = `rotate(${rot}deg)`; });
        const front = x + bw * .93;
        const pct = clamp((front - tr.left) / tr.width, 0, 1) * 100;
        title.style.clipPath = `inset(-10% ${100 - pct}% -10% 0)`;
        const rear = x + bw * .12;
        lines.forEach((l, i) => {
          const len = clamp(rear, 0, W * (.34 - i * .05));
          l.style.width = len + "px"; l.style.left = (rear - len) + "px";
        });
      };
      const frame = now => {
        if (!t0) t0 = now;
        const p = clamp((now - t0) / D, 0, 1);
        place(p);
        if (p < 1 && !skipped) raf = requestAnimationFrame(frame); else curtain();
      };
      const curtain = async () => {
        if (ended) return; ended = true;
        cancelAnimationFrame(raf);
        if (skipped) title.style.clipPath = "none";
        const cur = $(".intro-curtain");
        await new Promise(r => setTimeout(r, skipped ? 0 : 260));
        await cur.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], { duration: 480, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }).finished;
        intro.style.background = "var(--red)";
        $$(".intro-title,.intro-speed,.intro-road,.intro-bike,.intro-skip", intro).forEach(n => n.style.display = "none");
        scrollTo(0, 0);
        reveal();
        await intro.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], { duration: 700, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }).finished;
        done();
      };
      $(".intro-skip").addEventListener("click", () => { skipped = true; if (!ended) { cancelAnimationFrame(raf); curtain(); } });
      addEventListener("keydown", e => { if (e.key === "Escape" && !ended) { skipped = true; cancelAnimationFrame(raf); curtain(); } });
      place(0);
      raf = requestAnimationFrame(frame);
    } catch (err) { console.error(err); done(); reveal(); }
  }

  /* ---------- cabeçalho, menu, progresso ---------- */
  const hd = $(".hd"), nav = $("#nav"), burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
  const rideBike = $(".ride-bike"), rideBar = $(".ride-bar");
  rideBike.innerHTML = bike("scooter", "#d6001c", { label: "" });
  rideBike.firstElementChild.setAttribute("aria-hidden", "true");
  const rideWheels = $$(".wheel", rideBike);

  /* ---------- loop principal (roda, faixa, barra) ---------- */
  const bw = $(".bw-rot");
  const hero = $(".hero");
  let last = performance.now(), idle = 0, mqX = 0, vel = 0, lastY = scrollY, setW = 0;
  function loop(now) {
    const dt = Math.min(50, now - last); last = now;
    const y = scrollY;
    vel = vel * .9 + (y - lastY) * .1; lastY = y;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const prog = clamp(y / max, 0, 1);
    rideBar.style.transform = `scaleX(${prog})`;
    rideBike.style.transform = `translateX(${prog * (innerWidth - 42)}px)`;
    rideWheels.forEach(w => { w.style.transform = `rotate(${y * .7}deg)`; });
    hd.classList.toggle("scrolled", y > 8);
    if (y < innerHeight * 1.4) {
      if (!RM) idle += dt * .009;
      bw.style.transform = `rotate(${idle + y * .24}deg)`;
    }
    if (!setW) setW = mq.firstElementChild.getBoundingClientRect().width;
    if (!RM) {
      mqX -= .07 * dt + Math.abs(vel) * .4;
      if (setW && mqX < -setW) mqX += setW;
    }
    mq.style.transform = `skewY(1.2deg) translate3d(${mqX}px,0,0)`;
    requestAnimationFrame(loop);
  }
  addEventListener("resize", () => { setW = 0; });

  /* parallax suave da roda no hero (só com mouse) */
  if (matchMedia("(hover:hover)").matches && !RM) {
    const ww = $(".bigwheel-wrap");
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      ww.style.setProperty("--px", (nx * -26) + "px");
      ww.style.setProperty("--py", (ny * -18) + "px");
    });
  }

  /* ---------- vitrine ---------- */
  const chips = $("#chips"), grid = $("#grid"), sortEl = $("#sort");
  chips.innerHTML = CATEGORIAS.map(c => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === "todas"}">${c.nome}</button>`).join("");
  $("#dt").textContent = CONFIG.dataPrecos;

  function lista() {
    let l = MOTOS.filter(m => state.cat === "todas" || m.cat === state.cat);
    const s = state.sort;
    if (s === "preco-asc") l = [...l].sort((a, b) => a.n.pmin - b.n.pmin);
    if (s === "preco-desc") l = [...l].sort((a, b) => b.n.pmin - a.n.pmin);
    if (s === "potencia") l = [...l].sort((a, b) => b.n.pot - a.n.pot);
    if (s === "tanque") l = [...l].sort((a, b) => b.n.tanque - a.n.tanque);
    return l;
  }
  const cambioCurto = m => ({ auto: "Automático", semi: "Semiautomático", manual: "Manual" }[m.camb]);
  const potCurta = m => (Math.round(m.spec.potN * 10) / 10).toString().replace(".", ",") + " cv";
  const ghostTxt = m => up(m.nome.split(" ").slice(0, 2).join(" "));

  function cardHTML(m, k) {
    const c = corDe(m), on = state.cmp.includes(m.id);
    const lock = !on && state.cmp.length >= 3;
    return `<article class="card pop" style="--k:${k}" data-id="${m.id}">
      ${BADGES[m.id] ? `<span class="badge">${BADGES[m.id]}</span>` : ""}
      <div class="stage" data-open>
        <span class="gtxt" aria-hidden="true">${esc(ghostTxt(m))}</span>
        <div class="bikewrap">${visual(m, c, `${m.nome} na cor ${c.n}`)}</div>
      </div>
      <div class="info">
        <h3>${esc(up(m.nome))}</h3>
        <p class="tag">${esc(m.tag)}</p>
        <dl class="mini">
          <div><dt>Motor</dt><dd>${Math.round(m.n.cil)} cc</dd></div>
          <div><dt>Potência</dt><dd>${potCurta(m)}</dd></div>
          <div><dt>Câmbio</dt><dd>${cambioCurto(m)}</dd></div>
        </dl>
        <div class="buy">
          <div class="price"><small>a partir de</small><strong>${brl(m.n.pmin)}</strong></div>
          <div class="dots" role="group" aria-label="Cor da ${esc(m.nome)}">${m.cores.map((co, i) => `<button type="button" class="dot" data-cor="${i}" aria-pressed="${(state.cor[m.id] || 0) === i}" aria-label="${co.n}" title="${co.n}" style="background:${co.h}"></button>`).join("")}</div>
        </div>
        <div class="actions">
          <button class="btn btn-sm" type="button" data-open><span>Ver detalhes</span></button>
          <label class="cmp"><input type="checkbox" data-cmp ${on ? "checked" : ""} ${lock ? "disabled" : ""}> Comparar</label>
        </div>
      </div>
    </article>`;
  }

  let io;
  function observeCards() {
    if (io) io.disconnect();
    const cards = $$(".card", grid);
    const settle = c => c.classList.add("in", "settled");
    if (RM) { cards.forEach(settle); return; }
    io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const c = e.target; io.unobserve(c);
      c.classList.add("in");
      const bwp = $(".bikewrap", c);
      const end = () => c.classList.add("settled");
      bwp.addEventListener("animationend", end, { once: true });
      setTimeout(end, 1400);
    }), { threshold: .3 });
    cards.forEach(c => io.observe(c));
  }

  function renderGrid() {
    const l = lista();
    grid.innerHTML = l.map(cardHTML).join("") + `<aside class="card-cta">
      <div><h3>Não achou a sua?</h3><p>Me conta o que você procura e eu mostro as opções, versões e cores disponíveis na Motorac.</p></div>
      <a class="btn btn-inv" data-wa="Oi Brenda! Não achei a moto que procuro no seu site. Pode me ajudar?" target="_blank" rel="noopener"><span>Falar com a Brenda</span></a>
    </aside>`;
    bindWa(grid);
    observeCards();
  }
  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat;
    $$(".chip", chips).forEach(x => x.setAttribute("aria-pressed", x === b));
    renderGrid();
  });
  sortEl.addEventListener("change", () => { state.sort = sortEl.value; renderGrid(); });

  /* inclinação 3D do palco */
  if (matchMedia("(hover:hover)").matches && !RM) {
    let raf = 0;
    grid.addEventListener("pointermove", e => {
      const st = e.target.closest(".stage"); if (!st) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = st.getBoundingClientRect();
        st.style.setProperty("--mx", (((e.clientX - r.left) / r.width - .5) * 2).toFixed(3));
        st.style.setProperty("--my", (((e.clientY - r.top) / r.height - .5) * 2).toFixed(3));
      });
    });
    grid.addEventListener("pointerout", e => {
      const st = e.target.closest(".stage"); if (!st || st.contains(e.relatedTarget)) return;
      st.style.setProperty("--mx", 0); st.style.setProperty("--my", 0);
    });
  }

  grid.addEventListener("click", e => {
    const card = e.target.closest(".card"); if (!card) return;
    const m = byId(card.dataset.id);
    const dot = e.target.closest(".dot");
    if (dot) {
      if ((state.cor[m.id] || 0) === +dot.dataset.cor) return;
      state.cor[m.id] = +dot.dataset.cor;
      $$(".dot", card).forEach(d => d.setAttribute("aria-pressed", d === dot));
      const wrap = $(".bikewrap", card), c = corDe(m);
      trocarMoto(wrap, visual(m, c, `${m.nome} na cor ${c.n}`));
      return;
    }
    if (e.target.closest("[data-cmp]")) return;
    if (e.target.closest("[data-open]")) openDetail(m.id, e.target.closest("button"));
  });
  grid.addEventListener("change", e => {
    const cb = e.target.closest("[data-cmp]"); if (!cb) return;
    toggleCmp(e.target.closest(".card").dataset.id, cb.checked);
  });

  /* ---------- comparação ---------- */
  const tray = $("#tray"), trayList = $("#trayList"), trayGo = $("#trayGo");
  function syncCmpUI() {
    tray.hidden = state.cmp.length === 0;
    trayList.innerHTML = state.cmp.map(id => `<span class="tray-item">${esc(byId(id).nome)}<button type="button" data-rm="${id}" aria-label="Remover ${esc(byId(id).nome)}">×</button></span>`).join("");
    trayGo.toggleAttribute("disabled", state.cmp.length < 2);
    trayGo.firstElementChild.textContent = state.cmp.length < 2 ? "Marque mais 1" : `Comparar ${state.cmp.length}`;
    $$(".card", grid).forEach(c => {
      const id = c.dataset.id, cb = $("[data-cmp]", c), on = state.cmp.includes(id);
      cb.checked = on; cb.disabled = !on && state.cmp.length >= 3;
    });
  }
  function toggleCmp(id, on) {
    state.cmp = state.cmp.filter(x => x !== id);
    if (on && state.cmp.length < 3) state.cmp.push(id);
    syncCmpUI();
  }
  trayList.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) toggleCmp(b.dataset.rm, false); });
  $("#trayClear").addEventListener("click", () => { state.cmp = []; syncCmpUI(); });
  trayGo.addEventListener("click", () => { if (state.cmp.length >= 2) openCompare(); });

  /* ---------- janelas ---------- */
  let lastFocus = null;
  function openDlg(d, trigger) {
    lastFocus = trigger || document.activeElement;
    root.classList.add("modal-open");
    d.showModal();
    d.scrollTop = 0;
  }
  function closeDlg(d) {
    if (!d.open || d.classList.contains("closing")) return;
    d.classList.add("closing");
    setTimeout(() => { d.close(); d.classList.remove("closing"); }, RM ? 0 : 200);
  }
  $$("dialog").forEach(d => {
    d.addEventListener("cancel", e => { e.preventDefault(); closeDlg(d); });
    d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) closeDlg(d); });
    d.addEventListener("close", () => {
      if (!$$("dialog").some(x => x.open)) root.classList.remove("modal-open");
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    });
  });

  function barRow(label, val, max, txt) {
    return `<div class="bar-row"><span>${label}</span><div class="bar" role="img" aria-label="${label}: ${txt}"><i style="--v:${(val / max).toFixed(3)}"></i></div><b>${txt}</b></div>`;
  }
  function openDetail(id, trigger) {
    const m = byId(id), s = m.spec, dlg = $("#dlg");
    const c = corDe(m);
    $("#dlgBody").innerHTML = `<div class="dlg-grid">
      <div class="dlg-stage">
        <span class="gtxt" aria-hidden="true">${esc(ghostTxt(m))}</span>
        <div class="dlg-bike go">${visual(m, c, `${m.nome} na cor ${c.n}`)}</div>
        <div id="angSlot">${angulos(m, c)}</div>
        <div class="sw" role="group" aria-label="Cor"><span>Cor: <b id="swName">${c.n}</b></span>
          ${m.cores.map((co, i) => `<button type="button" class="dot" data-cor="${i}" aria-pressed="${co === c}" aria-label="${co.n}" style="background:${co.h}"></button>`).join("")}
        </div>
      </div>
      <div class="dlg-info">
        <h3 id="dlgTitle">${esc(up(m.nome))}</h3>
        <p class="tag">${esc(m.tag)}</p>
        <div class="vers">${m.versoes.map(v => `<div class="ver"><span>${esc(v.n)}</span>${v.p ? `<b>${brl(v.p)}</b>` : `<em>consulte</em>`}</div>`).join("")}</div>
        <div class="bars">
          ${barRow("Cilindrada", m.n.cil, MAX.cil, s.cil.replace(" cm³", " cc"))}
          ${barRow("Potência", m.n.pot, MAX.pot, potCurta(m))}
          ${barRow("Tanque", m.n.tanque, MAX.tanque, s.tanque)}
          ${barRow("Peso", m.n.peso, MAX.peso, s.peso)}
        </div>
        <table class="specs"><tbody>
          ${[["Potência", s.pot], ["Torque", s.torque], ["Câmbio", s.cambio], ["Combustível", s.comb], ["Altura do banco", s.banco], ["Freios", s.freio]].map(([k, v]) => `<tr><th scope="row">${k}</th><td>${esc(v)}</td></tr>`).join("")}
        </tbody></table>
        <ul class="hl">${m.destaques.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
        <div class="dlg-cta">
          <a class="btn" id="dlgWa" target="_blank" rel="noopener"><span>Perguntar sobre a ${esc(m.nome)}</span></a>
          <button class="btn ghost" type="button" id="dlgCmp"><span>${state.cmp.includes(m.id) ? "Tirar da comparação" : "Comparar"}</span></button>
        </div>
        <p class="fine">Imagens e cores ilustrativas. Preço de referência sugerido (base São Paulo, sem frete), consultado em ${CONFIG.dataPrecos}. Confirme valores, cores e condições com a Brenda.</p>
      </div>
    </div>`;
    const setWa = () => { $("#dlgWa").href = waLink(`Oi Brenda! Vi a ${m.nome} (${corDe(m).n}) no seu site e quero saber mais sobre valores e condições.`); };
    setWa();
    $("#dlgBody").onclick = e => {
      const dot = e.target.closest(".dot");
      if (dot) {
        if ((state.cor[m.id] || 0) === +dot.dataset.cor) return;
        state.cor[m.id] = +dot.dataset.cor;
        const cc = corDe(m), box = $(".dlg-bike", dlg);
        trocarMoto(box, visual(m, cc, `${m.nome} na cor ${cc.n}`));
        $("#angSlot", dlg).innerHTML = angulos(m, cc);
        $$(".dot", dlg).forEach(d => d.setAttribute("aria-pressed", d === dot));
        $("#swName", dlg).textContent = cc.n; setWa();
        const card = $(`.card[data-id="${m.id}"]`, grid);
        if (card) { $$(".dot", card).forEach((d, i) => d.setAttribute("aria-pressed", i === state.cor[m.id])); $(".bikewrap", card).innerHTML = visual(m, cc, `${m.nome} na cor ${cc.n}`); }
        return;
      }
      const ang = e.target.closest(".ang");
      if (ang) {
        const cc = corDe(m), box = $(".dlg-bike", dlg);
        clearTimeout(box._tm); clearTimeout(box._te); box.classList.remove("leave", "enter");
        box.classList.remove("go"); box.innerHTML = visual(m, cc, `${m.nome} na cor ${cc.n}`, +ang.dataset.ang);
        box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap");
        $$(".ang", dlg).forEach(b => b.setAttribute("aria-pressed", b === ang));
        return;
      }
      if (e.target.closest("#dlgCmp")) {
        const was = state.cmp.includes(m.id);
        if (!was && state.cmp.length >= 3) { $("#dlgCmp span").textContent = "Máximo de 3 motos"; return; }
        toggleCmp(m.id, !was);
        $("#dlgCmp span").textContent = !was ? "Tirar da comparação" : "Comparar";
      }
    };
    openDlg(dlg, trigger);
  }

  function openCompare() {
    const ms = state.cmp.map(byId), dlg = $("#cmp");
    const best = (key, dir) => {
      const vals = ms.map(m => m.n[key]);
      const t = dir > 0 ? Math.max(...vals) : Math.min(...vals);
      return new Set(vals).size === 1 ? [] : ms.filter(m => m.n[key] === t).map(m => m.id);
    };
    const rows = [
      ["A partir de", m => brl(m.n.pmin), best("pmin", -1)],
      ["Cilindrada", m => m.spec.cil.replace(" cm³", " cc"), best("cil", 1)],
      ["Potência", m => m.spec.pot, best("pot", 1)],
      ["Torque", m => m.spec.torque, []],
      ["Câmbio", m => m.spec.cambio, []],
      ["Combustível", m => m.spec.comb, []],
      ["Tanque", m => m.spec.tanque, best("tanque", 1)],
      ["Peso", m => m.spec.peso, best("peso", -1)],
      ["Altura do banco", m => m.spec.banco, []],
      ["Freios", m => m.spec.freio, []]
    ];
    const nomes = ms.map(m => m.nome);
    const lista = nomes.length > 1 ? nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1] : nomes[0];
    $("#cmpBody").innerHTML = `<div class="cmp-wrap">
      <h3 id="cmpTitle">Lado a lado</h3>
      <div class="cmp-scroll"><table class="cmp-table">
        <thead><tr><th scope="col"></th>${ms.map(m => `<th scope="col"><div class="bk">${visual(m, corDe(m), `${m.nome} na cor ${corDe(m).n}`)}</div><b>${esc(up(m.nome))}</b></th>`).join("")}</tr></thead>
        <tbody>${rows.map(([k, f, b]) => `<tr><th scope="row">${k}</th>${ms.map(m => `<td class="${b.includes(m.id) ? "best" : ""}">${esc(f(m))}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <div class="dlg-cta" style="margin-top:26px"><a class="btn" id="cmpWa" target="_blank" rel="noopener"><span>Pedir ajuda para escolher</span></a></div>
      <p class="fine">“Melhor” marca o maior ou menor valor entre as motos escolhidas, só como referência. Valores de referência sugeridos, consultados em ${CONFIG.dataPrecos}.</p>
    </div>`;
    $("#cmpWa").href = waLink(`Oi Brenda! Estou comparando ${lista} no seu site. Pode me ajudar a escolher?`);
    openDlg(dlg, trayGo);
  }

  /* ---------- quiz ---------- */
  const quizBox = $("#quizBox");
  const QS = [
    { t: "Para que você vai usar a moto?", k: "uso", o: [
      { v: "trabalho", l: "Trabalho e entregas", d: "Rodar todo dia gastando pouco" },
      { v: "cidade", l: "Ir e voltar na cidade", d: "Casa, estudo e rotina" },
      { v: "estrada", l: "Estrada e terra", d: "Sair do asfalto e viajar" },
      { v: "lazer", l: "Lazer e fim de semana", d: "Rodar por prazer" } ] },
    { t: "Como você gosta de pilotar?", k: "cambio", o: [
      { v: "facil", l: "Sem embreagem", d: "Só acelerar e frear" },
      { v: "manual", l: "Com marchas e embreagem", d: "Quero controle total" },
      { v: "any", l: "Tanto faz", d: "Me adapto a qualquer uma" } ] },
    { t: "Quanto pretende investir na moto?", k: "orc", o: [
      { v: 15000, l: "Até R$ 15 mil", d: "" }, { v: 22000, l: "Até R$ 22 mil", d: "" },
      { v: 30000, l: "Até R$ 30 mil", d: "" }, { v: 1e9, l: "Mais de R$ 30 mil", d: "" } ] }
  ];
  const USO_TXT = { trabalho: "trabalho e entregas", cidade: "o dia a dia na cidade", estrada: "estrada e terra", lazer: "lazer e fim de semana" };
  let qi = 0, qa = {};

  function renderQuiz() {
    if (qi >= QS.length) return renderResult();
    const q = QS[qi];
    quizBox.innerHTML = `<div class="q-top"><div class="q-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${QS.length}" aria-valuenow="${qi}"><i style="transform:scaleX(${(qi + 1) / QS.length})"></i></div><span class="q-n">${qi + 1} de ${QS.length}</span></div>
      <div class="q-step"><h3>${q.t}</h3>
      <div class="opts">${q.o.map((o, i) => `<button class="opt" type="button" data-i="${i}">${o.l}${o.d ? `<small>${o.d}</small>` : ""}</button>`).join("")}</div>
      ${qi ? `<button class="q-back" type="button" data-back>Voltar</button>` : ""}</div>`;
  }
  function score(m) {
    let s = (m.uso[qa.uso] || 0) * 3;
    const sem = m.camb === "auto" || m.camb === "semi";
    if (qa.cambio === "facil") s += sem ? 5 : -3;
    if (qa.cambio === "manual") s += sem ? 0 : 2;
    if (m.n.pmin <= qa.orc) s += 4 + (qa.orc < 1e8 ? 0 : m.n.pmin / 12000);
    else s -= (m.n.pmin - qa.orc) / 1500;
    if (m.id === "cg") s += .3;
    return s;
  }
  function renderResult() {
    const rank = MOTOS.filter(x => !x.semQuiz).sort((a, b) => score(b) - score(a));
    const m = rank[0], seg = rank[1], c = m.cores[0];
    const why = [];
    why.push(m.uso[qa.uso] >= 3 ? `Foi feita para ${USO_TXT[qa.uso]}` : `Atende bem ${USO_TXT[qa.uso]}`);
    if (qa.cambio === "facil") why.push((m.camb === "auto" || m.camb === "semi") ? `Sem embreagem: ${m.spec.cambio.toLowerCase()}` : `Tem embreagem, mas é uma moto fácil de aprender`);
    if (qa.cambio === "manual") why.push(`Câmbio ${m.spec.cambio.toLowerCase().replace("manual, ", "manual de ")}`);
    why.push(m.n.pmin <= qa.orc ? `A partir de ${brl(m.n.pmin)}, dentro do seu orçamento` : `A partir de ${brl(m.n.pmin)}, um pouco acima do que você pensou`);
    quizBox.innerHTML = `<div class="res">
      <div class="res-stage"><span class="gtxt" aria-hidden="true">${esc(ghostTxt(m))}</span><div class="bikewrap">${visual(m, c, `${m.nome} na cor ${c.n}`)}</div></div>
      <div><h3>${esc(up(m.nome))}</h3><p class="tag" style="min-height:0">${esc(m.tag)}</p>
        <ul class="why">${why.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
        <div class="res-cta"><button class="btn" type="button" data-open="${m.id}"><span>Ver detalhes</span></button>
          <a class="btn ghost" id="qWa" target="_blank" rel="noopener"><span>Falar com a Brenda</span></a></div>
        <p class="also">Também vale olhar a <button type="button" data-open="${seg.id}">${esc(seg.nome)}</button>. <button type="button" data-redo>Refazer o quiz</button></p>
      </div></div>`;
    $("#qWa").href = waLink(`Oi Brenda! O quiz do seu site indicou a ${m.nome} para mim. Pode me passar mais informações?`);
  }
  quizBox.addEventListener("click", e => {
    const o = e.target.closest(".opt");
    if (o) { const q = QS[qi]; qa[q.k] = q.o[+o.dataset.i].v; qi++; renderQuiz(); return; }
    if (e.target.closest("[data-back]")) { qi = Math.max(0, qi - 1); renderQuiz(); return; }
    if (e.target.closest("[data-redo]")) { qi = 0; qa = {}; renderQuiz(); return; }
    const op = e.target.closest("[data-open]"); if (op) openDetail(op.dataset.open, op);
  });
  renderQuiz();

  /* ---------- atendimento e contato ---------- */
  $("#promises").innerHTML = PROMESSAS.map(p => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg><b>${esc(p.t)}</b><span>${esc(p.d)}</span></li>`).join("");

  const cMoto = $("#cMoto");
  cMoto.innerHTML = `<option value="">Ainda não sei, quero ajuda</option>` + MOTOS.map(m => `<option value="${m.id}">${esc(m.nome)}</option>`).join("");
  $("#cPay").innerHTML = [["vista", "À vista"], ["fin", "Financiado"], ["nd", "Ainda não decidi"]].map(([v, l], i) => `<label><input type="radio" name="pay" value="${v}" ${i === 2 ? "checked" : ""}><span>${l}</span></label>`).join("");

  $("#compose").addEventListener("submit", e => {
    e.preventDefault();
    const nome = $("#cName").value.trim(), m = byId(cMoto.value), pay = $("input[name=pay]:checked").value;
    let t = "Oi Brenda!" + (nome ? ` Aqui é ${nome}.` : "");
    t += m ? ` Tenho interesse na ${m.nome}.` : " Ainda não sei qual moto escolher e queria ajuda.";
    if (pay === "vista") t += " Pretendo pagar à vista.";
    if (pay === "fin") t += " Pretendo financiar.";
    t += " Pode me passar mais informações?";
    $("#outText").value = t;
    const send = $("#outSend");
    send.href = waLink(t);
    send.firstElementChild.textContent = temZap() ? "Enviar no WhatsApp" : "Abrir o Instagram da Brenda";
    $("#out").hidden = false;
    $("#out").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" });
  });
  $("#outCopy").addEventListener("click", async () => {
    const ta = $("#outText"), lab = $("#outCopy span");
    try { await navigator.clipboard.writeText(ta.value); lab.textContent = "Texto copiado"; }
    catch (err) { ta.focus(); ta.select(); lab.textContent = "Selecione e copie"; }
    setTimeout(() => { lab.textContent = "Copiar texto"; }, 2200);
  });

  /* ---------- início ---------- */
  bindWa();
  renderGrid();
  syncCmpUI();
  requestAnimationFrame(loop);
  runIntro();
})();
