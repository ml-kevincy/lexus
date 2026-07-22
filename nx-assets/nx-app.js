/* ============================================================
   NX 車款介紹 Wireframe · 互動層
   ============================================================ */
(function () {
  const D = window.NXData;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const device = () => (window.__wf && window.__wf.device) || 'desktop';

  // 條件分類可見性（由 Tweaks 控制）
  window.NXState = window.NXState || { showCharge: true, showLink: true, carStyle: 'full', layout360: 'side' };

  function visibleFeatures() {
    return D.features.filter(f => {
      if (f.id === 'charge' && !window.NXState.showCharge) return false;
      if (f.id === 'link' && !window.NXState.showLink) return false;
      return true;
    });
  }

  /* ---- IMG placeholder helper ---- */
  function img(label, opts = {}) {
    const v = opts.variant ? ' wf-img--' + opts.variant : '';
    const n = el('div', 'wf-img nx-zoom' + v);
    if (opts.ratio) n.style.aspectRatio = opts.ratio;
    n.innerHTML = '<span class="wf-img__label">' + label + '</span>';
    n.dataset.zoom = label;
    return n;
  }

  /* ============================================================
     車款亮點
     ============================================================ */
  function renderHighlights() {
    const mount = $('#nx-highlights'); if (!mount) return;
    D.highlights.forEach((h) => {
      const card = el('article', 'nx-hl');
      card.innerHTML =
        '<span class="nx-hl__label">' + h.title + '</span>' +
        '<span class="nx-hl__text">' + h.text + '</span>';
      mount.appendChild(card);
    });
  }

  /* ============================================================
     360 賞車（兩層切換 + 拖曳旋轉）
     ============================================================ */
  function render360() {
    const mount = $('#nx-360'); if (!mount) return;
    const S = D.threeSixty;
    let view = 'ext', frame = 0, colorIdx = 0;

    mount.innerHTML =
      '<div class="nx-360__views" data-views></div>' +
      '<div class="nx-360__stage">' +
        '<div class="nx-360__viewer wf-img wf-img--plain" data-viewer>' +
          '<div class="nx-360__hint"><span class="ic">↔</span> 拖曳旋轉</div>' +
          '<span class="wf-img__label" data-vlabel></span>' +
        '</div>' +
      '</div>' +
      '<div class="nx-360__swatchwrap"><span class="wf-eyebrow" data-cname></span>' +
        '<div class="wf-swatches" data-swatches></div></div>';

    const viewsEl = $('[data-views]', mount);
    S.views.forEach(v => {
      const b = el('button', 'nx-360__view', '<span class="ic">' + (v.id === 'ext' ? '◧' : '◫') + '</span>' + v.label);
      b.dataset.view = v.id;
      b.addEventListener('click', () => { view = v.id; colorIdx = 0; sync(); });
      viewsEl.appendChild(b);
    });

    function sync() {
      $$('[data-view]', mount).forEach(b => b.setAttribute('aria-selected', b.dataset.view === view ? 'true' : 'false'));
      const cols = S.colors[view];
      const sw = $('[data-swatches]', mount); sw.innerHTML = '';
      cols.forEach((c, i) => {
        const s = el('span', 'wf-swatch'); s.style.background = c.hex;
        if (i === colorIdx) s.setAttribute('aria-current', 'true');
        s.title = c.name;
        s.addEventListener('click', () => { colorIdx = i; sync(); });
        sw.appendChild(s);
      });
      const c = cols[colorIdx];
      $('[data-cname]', mount).textContent = (view === 'ext' ? '外觀色 · ' : '內裝色 · ') + c.name;
      $('[data-vlabel]', mount).textContent = (view === 'ext' ? 'EXTERIOR' : 'INTERIOR') + ' · ' + c.name;
    }

    // 拖曳旋轉
    const viewer = $('[data-viewer]', mount);
    let dragging = false, lastX = 0;
    const start = (x) => { dragging = true; lastX = x; viewer.classList.add('is-drag'); };
    const move = (x) => {
      if (!dragging) return;
      const dx = x - lastX;
      if (Math.abs(dx) > 8) { frame = (frame + (dx > 0 ? 1 : -1) + S.frames) % S.frames; lastX = x; sync(); }
    };
    const end = () => { dragging = false; viewer.classList.remove('is-drag'); };
    viewer.addEventListener('pointerdown', e => { start(e.clientX); viewer.setPointerCapture(e.pointerId); });
    viewer.addEventListener('pointermove', e => move(e.clientX));
    viewer.addEventListener('pointerup', end);
    viewer.addEventListener('pointercancel', end);

    sync();
  }

  /* ============================================================
     特色 — 分類區段 + carousel
     ============================================================ */
  function renderFeatures() {
    const mount = $('#nx-features'); if (!mount) return;
    mount.innerHTML = '';
    visibleFeatures().forEach((f, fi) => {
      const sec = el('section', 'nx-feat' + (fi % 2 ? ' nx-feat--alt' : ''));
      sec.id = 'feat-' + f.id;
      sec.dataset.cat = f.cat;
      sec.dataset.screenLabel = '特色 · ' + f.cat;

      const head = el('div', 'wf-container');
      head.innerHTML =
        '<div class="nx-feat__head">' +
          '<div class="wf-sectiontitle"><span class="nx-feat__wordrow" style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap"><span class="word word--outline">' + f.en + '</span>' +
          (f.id === 'link' ? '' : '<span class="nx-feat__cat" style="font-family:var(--wf-mono);font-size:15px;letter-spacing:.16em;color:var(--wf-ink-2)">' + f.cat + '</span>') + '</span>' +
        '<span class="sub">' + f.sub + '</span><span class="cn">' + f.cn + '</span></div>' +
        '</div>';
      sec.appendChild(head);

      const wrap = el('div', 'wf-container');

      // 特色主視覺（16:9 圖片／影片，附右下播放鈕）
      const hero = img(f.cat + ' · 主視覺 KEY VISUAL', { ratio: '16/9' });
      hero.classList.add('nx-feat__hero');
      const heroPlay = el('button', 'nx-play nx-play--onimg', '<span class="ic">▶</span>');
      heroPlay.setAttribute('data-play', '');
      hero.appendChild(heroPlay);
      wrap.appendChild(hero);

      const car = el('div', 'nx-car');
      car.innerHTML = '<div class="nx-car__viewport"><div class="nx-car__track"></div></div>';
      const track = $('.nx-car__track', car);
      f.items.forEach((it, idx) => {
        const card = el('article', 'nx-fcard');
        const m = img(f.cat + ' · ' + it.en, { ratio: '4/3' });
        const play = el('button', 'nx-play nx-play--onimg', '<span class="ic">▶</span>');
        play.setAttribute('data-play', '');
        m.appendChild(play);
        card.appendChild(m);
        const tx = el('div', 'nx-fcard__txt');
        tx.innerHTML =
          '<h4 class="nx-fcard__title">' + it.t + '</h4>';
        const desc = el('p', 'wf-body'); desc.style.fontSize = '14px'; desc.textContent = it.d;
        tx.appendChild(desc);
        card.appendChild(tx);
        track.appendChild(card);
      });
      wrap.appendChild(car);

      // nav: 左箭頭 · 頁次 · 右箭頭
      const nav = el('div', 'nx-car__nav');
      nav.innerHTML =
        '<div class="wf-arrows"><button data-prev>‹</button></div>' +
        '<span class="nx-car__count" data-count></span>' +
        '<div class="wf-arrows"><button data-next>›</button></div>';
      wrap.appendChild(nav);
      sec.appendChild(wrap);
      mount.appendChild(sec);

      initCarousel(car, nav, f.items.length);
    });
    buildFeatNav();
  }

  function initCarousel(car, nav, total) {
    const viewport = $('.nx-car__viewport', car);
    const track = $('.nx-car__track', car);
    const countEl = $('[data-count]', nav);
    let index = 0;

    function step() {
      const card = track.children[0];
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 16) || 16;
      return card.offsetWidth + gap;
    }
    function maxScroll() { return Math.max(0, track.scrollWidth - viewport.clientWidth); }
    function apply(animate = true) {
      // 寬度足夠完整呈現所有卡片時：置中、隱藏下方切換列
      const fits = maxScroll() <= 1;
      track.style.justifyContent = fits ? 'center' : '';
      nav.style.display = fits ? 'none' : '';
      if (fits) index = 0;
      track.style.transition = animate ? 'transform .42s cubic-bezier(.4,0,.1,1)' : 'none';
      const t = Math.min(index * step(), maxScroll());
      track.style.transform = 'translateX(' + (-t) + 'px)';
      countEl.textContent = String(index + 1) + ' / ' + total;
      car.dataset.index = index;
    }
    function go(i) { index = Math.max(0, Math.min(total - 1, i)); apply(); }
    $('[data-prev]', nav).addEventListener('click', () => go(index - 1));
    $('[data-next]', nav).addEventListener('click', () => go(index + 1));

    // swipe
    let down = false, sx = 0, base = 0, captured = false, pid = null;
    viewport.addEventListener('pointerdown', e => { down = true; captured = false; pid = e.pointerId; sx = e.clientX; base = Math.min(index * step(), maxScroll()); track.style.transition = 'none'; });
    viewport.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      // 僅在實際拖曳（超過門檻）才捕捉指標，避免吃掉卡片內按鈕的點擊
      if (!captured && Math.abs(dx) > 6) { captured = true; try { viewport.setPointerCapture(pid); } catch (err) {} }
      if (!captured) return;
      track.style.transform = 'translateX(' + (-(base - dx)) + 'px)';
    });
    function release(e) {
      if (!down) return; down = false;
      const dx = e.clientX - sx;
      if (captured && Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1)); else apply();
      captured = false;
    }
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);

    car._recalc = () => apply(false);
    apply(false);
  }

  /* ============================================================
     特色詳細 — Modal / BottomSheet（上一項 / 下一項）
     ============================================================ */
  let detailCtx = null;
  function openDetail(catId) {
    const list = visibleFeatures();
    const idx = list.findIndex(x => x.id === catId); if (idx < 0) return;
    detailCtx = { catIdx: idx };
    let overlay = $('#nx-detail');
    if (!overlay) {
      overlay = el('div', 'nx-overlay'); overlay.id = 'nx-detail';
      overlay.innerHTML = '<div class="nx-overlay__bd" data-close></div><div class="nx-panel" data-panel></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeDetail(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });
    }
    overlay.className = 'nx-overlay is-open ' + (device() === 'mobile' ? 'nx-overlay--sheet' : 'nx-overlay--modal');
    overlay.style.setProperty('--nx-dev-w', ((window.WF_WIDTHS && window.WF_WIDTHS[device()]) || 1440) + 'px');
    paintDetail();
    document.body.style.overflow = 'hidden';
  }

  // 由特色 items 組出區塊序列（A 上圖下文 / B 左圖右文 / C 右圖左文 / D 引言 / E 輪播）
  function buildDetailBlocks(f) {
    const it = f.items, blocks = [];
    const body = (x) => [x.a.lead].concat(x.a.paras).join('');
    if (it[0]) blocks.push({ type: 'a', sub: it[0].t, en: it[0].en, body: body(it[0]), media: 'image' });
    if (it[1]) blocks.push({ type: 'b', sub: it[1].t, en: it[1].en, body: body(it[1]), media: 'video' });
    blocks.push({ type: 'd', quote: it[0] ? it[0].a.lead : f.cn });
    if (it[2]) blocks.push({ type: 'c', sub: it[2].t, en: it[2].en, body: body(it[2]), media: 'image' });
    const e = it[3] || it[0];
    if (e) blocks.push({ type: 'e', sub: e.t, en: e.en, body: e.a.lead, media: 'image', slides: 4, slideLabel: f.cat });
    return blocks;
  }

  function detailMedia(b, ratio) {
    const isVid = b.media === 'video';
    const cls = 'wf-img nxd-media' + (isVid ? ' wf-img--dark' : '');
    const label = (isVid ? 'VIDEO · ' : '') + (b.en || '');
    const play = isVid ? '<button class="nx-play nx-play--onimg"><span class="ic">▶</span></button>' : '';
    return '<div class="' + cls + '" style="aspect-ratio:' + ratio + '">' + play +
      '<span class="wf-img__label">' + label + '</span></div>';
  }

  function detailText(b) {
    return '<div class="nxd-text">' +
      '<h3 class="nxd-bsub">' + b.sub + '</h3>' +
      '<p class="wf-body">' + b.body + '</p></div>';
  }

  function renderBlock(b) {
    if (b.type === 'd') return '<blockquote class="nxd-block nxd-quote">' + b.quote + '</blockquote>';
    if (b.type === 'a') return '<section class="nxd-block nxd-block--a">' + detailMedia(b, '16/9') + detailText(b) + '</section>';
    if (b.type === 'b') return '<section class="nxd-block nxd-split">' + detailMedia(b, '4/3') + detailText(b) + '</section>';
    if (b.type === 'c') return '<section class="nxd-block nxd-split nxd-split--rev">' + detailText(b) + detailMedia(b, '4/3') + '</section>';
    if (b.type === 'e') {
      const n = b.slides || 4; let slides = '';
      for (let i = 0; i < n; i++) {
        slides += '<div class="nxd-slide wf-img"><span class="wf-img__label">' + b.slideLabel + ' · 視角 ' + (i + 1) + '</span></div>';
      }
      return '<section class="nxd-block nxd-carousel" data-carousel>' +
        '<div class="nxd-carousel__view"><div class="nxd-carousel__track">' + slides + '</div></div>' +
        '<div class="nxd-carousel__nav"><div class="wf-arrows"><button data-cprev>‹</button></div>' +
        '<span class="nxd-carousel__count" data-ccount></span>' +
        '<div class="wf-arrows"><button data-cnext>›</button></div></div>' +
        detailText(b) + '</section>';
    }
    return '';
  }

  function wireCarousel(c) {
    const track = $('.nxd-carousel__track', c);
    const slides = $$('.nxd-slide', c);
    const count = $('[data-ccount]', c);
    let i = 0;
    const upd = () => { track.style.transform = 'translateX(-' + (i * 100) + '%)'; count.textContent = (i + 1) + ' / ' + slides.length; };
    $('[data-cprev]', c).addEventListener('click', () => { i = (i - 1 + slides.length) % slides.length; upd(); });
    $('[data-cnext]', c).addEventListener('click', () => { i = (i + 1) % slides.length; upd(); });
    upd();
  }

  // 上一項 / 下一項：在當頁捲動到上一個 / 下一個段落（區塊標題）
  function smoothScrollTo(elm, to, dur) {
    const start = elm.scrollTop, diff = to - start, t0 = performance.now();
    if (Math.abs(diff) < 2) { elm.scrollTop = to; return; }
    (function step(now) {
      const p = Math.min(1, (now - t0) / (dur || 380));
      elm.scrollTop = start + diff * (0.5 - 0.5 * Math.cos(Math.PI * p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function scrollToBlock(panel, dir) {
    const scroll = $('.nx-panel__scroll', panel);
    const blocks = $$('.nxd-block', scroll);
    if (!blocks.length) return;
    const sTop = scroll.getBoundingClientRect().top;
    const tops = blocks.map(b => b.getBoundingClientRect().top - sTop + scroll.scrollTop);
    let cur = 0;
    tops.forEach((y, i) => { if (y <= scroll.scrollTop + 8) cur = i; });
    const target = Math.min(blocks.length - 1, Math.max(0, cur + dir));
    smoothScrollTo(scroll, Math.max(0, tops[target] - 4), 380);
  }

  function paintDetail() {
    const overlay = $('#nx-detail'); const panel = $('[data-panel]', overlay);
    const list = visibleFeatures();
    const f = list[detailCtx.catIdx];
    const blocks = buildDetailBlocks(f);
    panel.innerHTML =
      '<div class="nx-panel__top">' +
        '<div>' +
        '<h2 class="wf-h2 nxd-title">' + f.cat + '</h2>' +
        '<p class="nxd-subtitle">' + f.cn + '</p></div>' +
        '<button class="nx-panel__x" data-close aria-label="close">✕</button>' +
      '</div>' +
      '<div class="nx-panel__scroll nxd-scroll">' + blocks.map(renderBlock).join('') + '</div>' +
      '<div class="nx-panel__foot">' +
        '<button class="wf-btn wf-btn--secondary wf-btn--sm" data-closef>關閉</button>' +
        '<button class="wf-btn wf-btn--ghost wf-btn--sm" data-pv>‹ 上一項</button>' +
        '<button class="wf-btn wf-btn--ghost wf-btn--sm" data-nx>下一項 ›</button>' +
      '</div>';
    $('[data-pv]', panel).addEventListener('click', () => scrollToBlock(panel, -1));
    $('[data-nx]', panel).addEventListener('click', () => scrollToBlock(panel, 1));
    $('[data-closef]', panel).addEventListener('click', closeDetail);
    $('.nx-panel__x', panel).addEventListener('click', closeDetail);
    $$('[data-carousel]', panel).forEach(wireCarousel);
    $('.nx-panel__scroll', panel).scrollTop = 0;
  }
  function closeDetail() { const o = $('#nx-detail'); if (o) o.classList.remove('is-open'); document.body.style.overflow = ''; }

  /* ============================================================
     重點比較（水平捲動卡片）
     ============================================================ */
  function renderCompare() {
    const mount = $('#nx-compare'); if (!mount) return;
    const car = el('div', 'nx-car');
    car.innerHTML = '<div class="nx-car__viewport"><div class="nx-car__track"></div></div>';
    const track = $('.nx-car__track', car);
    D.compare.forEach(c => {
      const card = el('article', 'nx-cmp');
      card.innerHTML =
        '<div class="wf-img" style="aspect-ratio:16/10"><span class="wf-img__label">' + c.grade + '</span></div>' +
        '<div class="nx-cmp__body">' +
          '<div class="nx-cmp__head"><h4 class="nx-cmp__name">' + c.grade + '</h4>' +
          '<span class="wf-tag wf-tag--solid">' + c.power + '</span></div>' +
          '<div class="nx-cmp__price"><span class="wf-anno">建議售價</span><b>NT$ ' + c.price + ' 萬</b></div>' +
          '<span class="wf-eyebrow" style="display:block;margin:6px 0 4px">重點功能</span>' +
          '<ul class="nx-cmp__diff">' + c.diff.map(d => '<li>' + d + '</li>').join('') + '</ul>' +
        '</div>';
      track.appendChild(card);
    });
    mount.appendChild(car);

    const nav = el('div', 'nx-car__nav');
    nav.innerHTML =
      '<div class="wf-arrows"><button data-prev>‹</button></div>' +
      '<span class="nx-car__count" data-count></span>' +
      '<div class="wf-arrows"><button data-next>›</button></div>';
    mount.appendChild(nav);

    initCarousel(car, nav, D.compare.length);
  }

  /* ============================================================
     規格表（僅顯示差異 toggle / 基本·進階收合）
     ============================================================ */
  function buildSpecTable(mount, G, S) {
    if (!mount) return;
    const open = S.groups.map(() => false);
    let allOpen = false;
    let cols = [0, 1, 2].slice(0, G.length);
    let sel = Math.max(0, cols.indexOf(G.indexOf(S.model)));
    let diffOnly = false;
    const same = arr => arr.every(v => v === arr[0]);
    const disp = arr => cols.map(gi => arr[gi]);
    const cell = (v, c) => '<span class="nx-spec3__v" data-col="' + c + '">' + (v === '●' ? '<span class="nx-spec3__dot"></span>' : v) + '</span>';
    const vCells = arr => cols.map((gi, c) => cell(arr[gi], c)).join('');
    const rowHtml = (k, arr, extra) =>
      '<div class="nx-spec3__row' + (extra || '') + '"><span class="nx-spec3__k">' + k + '</span>' + vCells(arr) + '</div>';
    function headRow() {
      return '<div class="nx-spec3__row nx-spec3__row--head"><span class="nx-spec3__k">車型</span>' +
        cols.map((gi, c) => {
          const dis = c === 2;
          return '<span class="nx-spec3__v' + (dis ? ' is-disabled' : '') + '" data-col="' + c + '"><span class="nx-spec3__colsel nx-eqfilter__select"><select data-colsel="' + c + '"' + (dis ? ' disabled' : '') + '>' +
            G.map((g, i) => '<option' + (i === gi ? ' selected' : '') + '>' + g + '</option>').join('') +
          '</select><span class="chev">▾</span></span></span>';
        }).join('') + '</div>';
    }
    function build() {
      let html = '<div class="nx-spec3__filter"><label class="nx-switch"><input type="checkbox" data-allopen' + (allOpen ? ' checked' : '') + '><span class="nx-switch__t"></span>全部展開</label><label class="nx-switch"><input type="checkbox" data-diff' + (diffOnly ? ' checked' : '') + '><span class="nx-switch__t"></span>僅顯示差異規格</label></div>';
      html += '<div class="nx-spec3" data-sel="' + sel + '">';
      html += '<div class="nx-spec3__top">' +
        '<div class="nx-spec3__pick"><span class="nx-spec3__toplabel">車型</span>' +
          '<div class="nx-eqfilter__select"><select data-specmodel>' +
            cols.map((gi, c) => '<option value="' + c + '"' + (c === sel ? ' selected' : '') + (c === 2 ? ' disabled' : '') + '>' + G[gi] + '</option>').join('') +
          '</select><span class="chev">▾</span></div></div>' +
        headRow() +
        rowHtml('建議售價（萬）', S.price, ' nx-spec3__row--price') +
      '</div>';
      S.groups.forEach((grp, gi) => {
        const rows = diffOnly ? grp.rows.filter(r => !same(disp(r.v))) : grp.rows;
        if (!rows.length) return;
        html += '<button class="nx-spec3__ghead" data-g="' + gi + '"><span>' + grp.group + '</span><span class="chev">' + (open[gi] ? '▴' : '▾') + '</span></button>';
        if (open[gi]) html += '<div class="nx-spec3__rows">' + rows.map(r => rowHtml(r.k, r.v)).join('') + '</div>';
      });
      html += '<div class="nx-spec3__notes">' + S.notes.map(n => '<p>' + n + '</p>').join('') + '</div>';
      html += '</div>';
      mount.innerHTML = html;
      const root = $('.nx-spec3', mount);
      $('[data-diff]', mount).addEventListener('change', e => { diffOnly = e.target.checked; build(); });
      $('[data-allopen]', mount).addEventListener('change', e => { allOpen = e.target.checked; open.forEach((_, i) => open[i] = allOpen); build(); });
      $('[data-specmodel]', mount).addEventListener('change', e => { sel = +e.target.value; root.dataset.sel = sel; });
      $$('[data-colsel]', mount).forEach(s => s.addEventListener('change', e => { cols[+e.target.dataset.colsel] = e.target.selectedIndex; build(); }));
      $$('[data-g]', mount).forEach(h => h.addEventListener('click', () => { const i = +h.dataset.g; open[i] = !open[i]; allOpen = open.every(Boolean); build(); }));
    }
    build();
  }

  function renderSpec() { buildSpecTable($('#nx-spec'), D.grades, D.spec); }

  /* 規格配備表「配備」分頁：三車型逐項對照 */
  function renderSpecEquip() { buildSpecTable($('#nx-spec-equip'), D.equipGradesC, D.equipCompare); }

  function wireSpecTabs() {
    const bar = $('#nx-spectab'); if (!bar || bar.dataset.ready) return;
    bar.dataset.ready = '1';
    const spec = $('#nx-spec'), equip = $('#nx-spec-equip');
    $$('[data-spectab]', bar).forEach(btn => btn.addEventListener('click', () => {
      $$('[data-spectab]', bar).forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      const isSpec = btn.dataset.spectab === 'spec';
      if (spec) spec.hidden = !isSpec;
      if (equip) equip.hidden = isSpec;
    }));
  }
  let equipFilter = '';
  let equipTab = 0;
  let equipExpanded = false;
  function renderEquip() {
    const mount = $('#nx-equip'); if (!mount) return;
    const bar = $('#nx-equip-filter');
    if (bar && !bar.dataset.ready) {
      bar.dataset.ready = '1';
      bar.innerHTML =
        '<span class="wf-eyebrow">車型篩選</span>' +
        '<div class="nx-eqfilter__select"><select data-eqfilter>' +
          D.equipGrades.map((g, i) => '<option value="' + g + '"' + (i === 0 ? ' selected' : '') + '>' + g + '</option>').join('') +
        '</select><span class="chev">▾</span></div>';
      bar.querySelector('[data-eqfilter]').addEventListener('change', e => { equipFilter = e.target.value; paintEquip(); });
    }
    equipFilter = bar.querySelector('[data-eqfilter]').value;
    paintEquip();
  }

  function paintEquip() {
    const mount = $('#nx-equip'); if (!mount) return;
    mount.innerHTML = '';
    const groups = D.equip;
    if (equipTab >= groups.length) equipTab = 0;

    // 橫向分類列（可捲動，右側「更多」開啟分類選單）
    const tabwrap = el('div', 'nx-eqtabs');
    const rail = el('div', 'nx-eqtabs__rail');
    groups.forEach((grp, gi) => {
      const t = el('button', 'nx-eqtab' + (gi === equipTab ? ' is-active' : ''), grp.cat);
      t.addEventListener('click', () => { equipTab = gi; equipExpanded = false; paintEquip(); });
      rail.appendChild(t);
    });
    const more = el('button', 'nx-eqtabs__more', '▾');
    more.setAttribute('aria-label', '全部分類');
    const menu = el('div', 'nx-catmenu nx-eqmenu');
    menu.innerHTML =
      '<span class="wf-eyebrow nx-catmenu__hd">全部分類</span>' +
      '<div class="nx-catmenu__grid">' +
        groups.map((grp, gi) =>
          '<button class="nx-catmenu__item' + (gi === equipTab ? ' is-current' : '') + '" data-eqgo="' + gi + '">' +
          '<span class="nx-catmenu__cn">' + grp.cat + '</span>' +
          '<span class="wf-anno">' + grp.items.length + '</span></button>').join('') +
      '</div>';
    more.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('is-open');
    });
    menu.querySelectorAll('[data-eqgo]').forEach(b => b.addEventListener('click', () => {
      equipTab = +b.dataset.eqgo; equipExpanded = false; paintEquip();
    }));
    document.addEventListener('click', function onDoc(e) {
      if (!menu.isConnected) { document.removeEventListener('click', onDoc); return; }
      if (!e.target.closest('.nx-eqmenu') && !e.target.closest('.nx-eqtabs__more')) menu.classList.remove('is-open');
    });
    tabwrap.appendChild(rail);
    tabwrap.appendChild(more);
    tabwrap.appendChild(menu);
    mount.appendChild(tabwrap);

    // 項目列表（縮圖 + 名稱 + 說明）
    const grp = groups[equipTab];
    const EQ_PREVIEW = 4;
    const shown = equipExpanded ? grp.items : grp.items.slice(0, EQ_PREVIEW);
    const list = el('div', 'nx-eqcards');
    shown.forEach(name => {
      const card = el('article', 'nx-eqcard');
      const thumb = img(grp.cat + ' · ' + name, { ratio: '1/1' });
      thumb.classList.add('nx-eqcard__thumb');
      const tx = el('div', 'nx-eqcard__tx');
      tx.innerHTML =
        '<div class="nx-eqcard__row"><h4 class="nx-eqcard__name">' + name + '</h4><span class="nx-eqcard__go" aria-hidden="true">›</span></div>' +
        '<p class="nx-eqcard__desc">配備說明文字，介紹此項配備的功能與使用情境，依實車與車型等級為準。</p>';
      card.appendChild(thumb);
      card.appendChild(tx);
      card.addEventListener('click', () => openEquipSheet(grp.cat, name));
      list.appendChild(card);
    });
    mount.appendChild(list);

    // 看更多 / 收合
    if (grp.items.length > EQ_PREVIEW) {
      const moreWrap = el('div', 'nx-eqmore');
      const moreBtn = el('button', 'wf-btn wf-btn--secondary',
        equipExpanded ? '收合' : '看更多（' + (grp.items.length - EQ_PREVIEW) + '）');
      moreBtn.addEventListener('click', () => { equipExpanded = !equipExpanded; paintEquip(); });
      moreWrap.appendChild(moreBtn);
      mount.appendChild(moreWrap);
    }
  }

  /* 配備 BottomSheet：圖片輪播 + 名稱 + 說明 */
  function openEquipSheet(cat, name) {
    let overlay = $('#nx-eqsheet');
    if (!overlay) {
      overlay = el('div', 'nx-overlay nx-eqsheet'); overlay.id = 'nx-eqsheet';
      overlay.innerHTML = '<div class="nx-overlay__bd" data-close></div><div class="nx-panel" data-panel></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeEquipSheet(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEquipSheet(); });
    }
    overlay.style.setProperty('--nx-dev-w', ((window.WF_WIDTHS && window.WF_WIDTHS[device()]) || 1440) + 'px');
    const panel = $('[data-panel]', overlay);
    const imgs = 5;
    let frame = 0;
    const specName = ['標準型', '進階型', 'F SPORT 樣式', '旗艦型', '頂級選配'];
    panel.innerHTML =
      '<div class="nx-panel__top"><div><span class="wf-eyebrow">' + cat + '</span>' +
        '<h2 class="wf-h2 nxeq-sheet__title">' + name + '</h2></div>' +
        '<button class="nx-panel__x" data-close aria-label="關閉">✕</button></div>' +
      '<div class="nx-panel__scroll">' +
        '<div class="nxeq-sheet__car">' +
          '<div class="wf-img nxeq-sheet__media" style="aspect-ratio:4/3"><span class="wf-img__label" data-label></span></div>' +
        '</div>' +
        '<div class="nxeq-sheet__nav">' +
          '<button class="nxeq-sheet__arrow" data-prev aria-label="上一張">‹</button>' +
          '<span class="nxeq-sheet__count" data-count></span>' +
          '<button class="nxeq-sheet__arrow" data-next aria-label="下一張">›</button>' +
        '</div>' +
        '<h3 class="nxeq-sheet__sub" data-sub></h3>' +
        '<p class="nxeq-sheet__desc" data-desc></p>' +
      '</div>' +
      '<div class="nx-panel__foot"><button class="wf-btn wf-btn--secondary" data-closef>關閉</button></div>';
    const label = $('[data-label]', panel);
    const count = $('[data-count]', panel);
    const sub = $('[data-sub]', panel);
    const desc = $('[data-desc]', panel);
    function paint() {
      const sp = specName[frame] || ('規格 ' + (frame + 1));
      label.textContent = cat + ' · ' + name + ' · ' + sp;
      count.textContent = (frame + 1) + ' / ' + imgs;
      sub.textContent = name + '（' + sp + '）';
      desc.textContent = sp + '的配備說明文字，介紹此規格下該項配備的功能、材質與使用情境。實際配備依各車型等級與實車為準。';
    }
    $('[data-prev]', panel).addEventListener('click', () => { frame = (frame - 1 + imgs) % imgs; paint(); });
    $('[data-next]', panel).addEventListener('click', () => { frame = (frame + 1) % imgs; paint(); });
    $('.nx-panel__x', panel).addEventListener('click', closeEquipSheet);
    $('[data-closef]', panel).addEventListener('click', closeEquipSheet);
    paint();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeEquipSheet() {
    const o = $('#nx-eqsheet'); if (o) o.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* 特色卡片 BottomSheet（示意）：標題 + 圖片輪播 + 左右切換/頁次 + 說明 + 關閉 */
  function openFeatSheet(f, it) {
    let overlay = $('#nx-featsheet');
    if (!overlay) {
      overlay = el('div', 'nx-overlay nx-eqsheet'); overlay.id = 'nx-featsheet';
      overlay.innerHTML = '<div class="nx-overlay__bd" data-close></div><div class="nx-panel" data-panel></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeFeatSheet(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFeatSheet(); });
    }
    overlay.style.setProperty('--nx-dev-w', ((window.WF_WIDTHS && window.WF_WIDTHS[device()]) || 1440) + 'px');
    const panel = $('[data-panel]', overlay);
    const slides = (it.sheet && it.sheet.length) ? it.sheet : [{ t: it.t, d: it.d }];
    const imgs = slides.length;
    let frame = 0;
    panel.innerHTML =
      '<div class="nx-panel__top"><div>' +
        '<h2 class="wf-h2 nxeq-sheet__title" data-title></h2></div>' +
        '<button class="nx-panel__x" data-close aria-label="關閉">✕</button></div>' +
      '<div class="nx-panel__scroll">' +
        '<div class="nxeq-sheet__car">' +
          '<div class="wf-img nxeq-sheet__media" style="aspect-ratio:16/9"><span class="wf-img__label" data-label></span></div>' +
        '</div>' +
        '<div class="nxeq-sheet__nav">' +
          '<button class="nxeq-sheet__arrow" data-prev aria-label="上一張">‹</button>' +
          '<span class="nxeq-sheet__count" data-count></span>' +
          '<button class="nxeq-sheet__arrow" data-next aria-label="下一張">›</button>' +
        '</div>' +
        '<p class="nxeq-sheet__desc" data-desc></p>' +
      '</div>' +
      '<div class="nx-panel__foot"><button class="wf-btn wf-btn--secondary" data-closef>關閉</button></div>';
    const titleEl = $('[data-title]', panel);
    const label = $('[data-label]', panel);
    const count = $('[data-count]', panel);
    const descEl = $('[data-desc]', panel);
    function paint() {
      const s = slides[frame];
      titleEl.textContent = s.t;
      label.textContent = it.t + ' · ' + s.t;
      count.textContent = (frame + 1) + ' / ' + imgs;
      descEl.textContent = s.d;
    }
    $('[data-prev]', panel).addEventListener('click', () => { frame = (frame - 1 + imgs) % imgs; paint(); });
    $('[data-next]', panel).addEventListener('click', () => { frame = (frame + 1) % imgs; paint(); });
    $('.nx-panel__x', panel).addEventListener('click', closeFeatSheet);
    $('[data-closef]', panel).addEventListener('click', closeFeatSheet);
    paint();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeFeatSheet() {
    const o = $('#nx-featsheet'); if (o) o.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ============================================================
     FAQ（分類切換 + accordion）
     ============================================================ */
  function renderFaq() {
    const mount = $('#nx-faq'); if (!mount) return;
    let cat = 0;
    let faqExpanded = false;
    const FAQ_PREVIEW = 4;
    const tabwrap = el('div', 'nx-faq__tabwrap');
    const tabs = el('div', 'wf-tabs nx-faq__tabs');
    D.faq.forEach((f, i) => {
      const t = el('button', 'wf-tab', f.cat);
      t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      t.addEventListener('click', () => { cat = i; faqExpanded = false; paint(); centerTab(t); });
      tabs.appendChild(t);
    });
    const more = el('button', 'nx-faq__more', '<span class="chev">▾</span>');
    more.setAttribute('data-faqmore', '');
    tabwrap.appendChild(tabs); tabwrap.appendChild(more);
    const list = el('div', 'nx-faq__list');
    mount.appendChild(tabwrap); mount.appendChild(list);

    function centerTab(t) {
      const target = t.offsetLeft - (tabs.clientWidth - t.offsetWidth) / 2;
      tabs.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }

    // 「更多」→ 向下展開全部分類選單
    let menu = null;
    function closeMenu() { if (menu) menu.classList.remove('is-open'); more.setAttribute('aria-expanded', 'false'); }
    function toggleMenu() {
      if (menu && menu.classList.contains('is-open')) { closeMenu(); return; }
      if (!menu) { menu = el('div', 'nx-catmenu'); tabwrap.appendChild(menu); }
      menu.innerHTML = '<span class="wf-eyebrow nx-catmenu__hd">問答分類</span>' +
        '<div class="nx-catmenu__grid">' +
          D.faq.map((f, i) => '<button class="nx-catmenu__item' + (i === cat ? ' is-current' : '') + '" data-faqgo="' + i + '"><span class="nx-catmenu__cn">' + f.cat + '</span></button>').join('') +
        '</div>';
      $$('[data-faqgo]', menu).forEach(b => b.addEventListener('click', () => { cat = +b.dataset.faqgo; faqExpanded = false; closeMenu(); paint(); const t = $$('.wf-tab', tabs)[cat]; if (t) centerTab(t); }));
      more.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => menu.classList.add('is-open'));
    }
    more.addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
    document.addEventListener('click', e => { if (!e.target.closest('.nx-faq__tabwrap')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    function paint() {
      $$('.wf-tab', tabs).forEach((t, i) => t.setAttribute('aria-selected', i === cat ? 'true' : 'false'));
      list.innerHTML = '';
      const all = D.faq[cat].items;
      const shown = faqExpanded ? all : all.slice(0, FAQ_PREVIEW);
      shown.forEach(qa => {
        const item = el('div', 'nx-qa');
        item.innerHTML =
          '<button class="nx-qa__q"><span>' + qa.q + '</span><span class="chev">＋</span></button>' +
          '<div class="nx-qa__a"><p class="wf-body">' + qa.a + '</p></div>';
        item.querySelector('.nx-qa__q').addEventListener('click', () => { item.classList.toggle('is-open'); item.querySelector('.chev').textContent = item.classList.contains('is-open') ? '－' : '＋'; });
        list.appendChild(item);
      });
      if (all.length > FAQ_PREVIEW) {
        const moreWrap = el('div', 'nx-eqmore');
        const moreBtn = el('button', 'wf-btn wf-btn--secondary',
          faqExpanded ? '收合' : '看更多（' + (all.length - FAQ_PREVIEW) + '）');
        moreBtn.addEventListener('click', () => { faqExpanded = !faqExpanded; paint(); });
        moreWrap.appendChild(moreBtn);
        list.appendChild(moreWrap);
      }
    }
    paint();
  }

  /* ============================================================
     特色分類 sticky 導覽 + scrollspy
     ============================================================ */
  let spyObs = null;
  function scrollToFeat(id) {
    const sec = $('#' + id);
    if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  }
  function centerNavBtn(btn) {
    const row = $('.nx-featnav__row'); if (!row || !btn) return;
    const target = btn.offsetLeft - (row.clientWidth - btn.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }
  function buildFeatNav() {
    const nav = $('#nx-featnav'); if (!nav) return;
    const inner = $('.nx-featnav__row', nav);
    inner.innerHTML = '';
    const feats = visibleFeatures();
    feats.forEach((f, i) => {
      const b = el('button', 'nx-featnav__btn', f.cat);
      b.dataset.target = 'feat-' + f.id;
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => { scrollToFeat('feat-' + f.id); centerNavBtn(b); });
      inner.appendChild(b);
    });

    // 規格 / 配備（捲動至對應區段）
    [['nx-equip-section', '車款特色'], ['nx-spec-section', '規格配備']].forEach(([id, label]) => {
      const b = el('button', 'nx-featnav__btn', label);
      b.dataset.target = id;
      b.addEventListener('click', () => { scrollToFeat(id); centerNavBtn(b); });
      inner.appendChild(b);
    });

    // 「更多」按鈕 → 展開向下分類選單
    const moreBtn = $('[data-featmore]', nav);
    if (moreBtn && !moreBtn.dataset.ready) {
      moreBtn.dataset.ready = '1';
      moreBtn.addEventListener('click', e => { e.stopPropagation(); toggleCatMenu(); });
      document.addEventListener('click', e => { if (!e.target.closest('.nx-catmenu') && !e.target.closest('[data-featmore]')) closeCatMenu(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCatMenu(); });
    }

    // 寬度足夠（按鈕未溢出）時自動隱藏「更多」
    updateFeatMore();
    if (!buildFeatNav._resize) {
      buildFeatNav._resize = true;
      window.addEventListener('resize', updateFeatMore);
    }

    if (spyObs) spyObs.disconnect();
    spyObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = en.target.id;
          let active = null;
          $$('.nx-featnav__btn', nav).forEach(b => {
            const on = b.dataset.target === id;
            b.setAttribute('aria-current', on ? 'true' : 'false');
            if (on) active = b;
          });
          if (active) centerNavBtn(active);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    feats.forEach(f => { const s = $('#feat-' + f.id); if (s) spyObs.observe(s); });
    ['nx-spec-section', 'nx-equip-section'].forEach(id => { const s = $('#' + id); if (s) spyObs.observe(s); });
  }

  function updateFeatMore() {
    const nav = $('#nx-featnav'); if (!nav) return;
    const inner = $('.nx-featnav__row', nav);
    const moreBtn = $('[data-featmore]', nav);
    if (!inner || !moreBtn) return;
    // 容許 1px 誤差：未溢出則隱藏「更多」
    const overflow = inner.scrollWidth - inner.clientWidth > 1;
    if (!overflow) { moreBtn.style.display = 'none'; closeCatMenu(); }
    else { moreBtn.style.display = ''; }
  }

  function toggleCatMenu() {
    const wrap = $('.nx-featnav__wrap'); if (!wrap) return;
    let menu = $('.nx-catmenu', wrap);
    if (menu && menu.classList.contains('is-open')) { closeCatMenu(); return; }
    if (!menu) { menu = el('div', 'nx-catmenu'); wrap.appendChild(menu); }
    const cur = $('.nx-featnav__btn[aria-current="true"]');
    const curId = cur ? cur.dataset.target : null;
    const feats = visibleFeatures();
    const mandatory = feats.filter(f => !f.optional);
    const optional = feats.filter(f => f.optional);
    const item = (go, cn, en, full) =>
      '<button class="nx-catmenu__item' + (go === curId ? ' is-current' : '') + (full ? ' nx-catmenu__item--full' : '') + '" data-go="' + go + '">' +
      '<span class="nx-catmenu__cn">' + cn + '</span>' +
      '<span class="wf-anno">' + en + '</span></button>';
    menu.innerHTML =
      '<span class="wf-eyebrow nx-catmenu__hd">特色分類</span>' +
      '<div class="nx-catmenu__grid">' +
        mandatory.map(f => item('feat-' + f.id, f.cat, f.en)).join('') +
        optional.map(f => item('feat-' + f.id, f.cat, f.en, optional.length === 1)).join('') +
        item('nx-equip-section', '車款特色', 'EQUIPMENT') +
        item('nx-spec-section', '規格配備', 'SPECIFICATIONS') +
      '</div>';
    $$('[data-go]', menu).forEach(b => b.addEventListener('click', () => { closeCatMenu(); setTimeout(() => scrollToFeat(b.dataset.go), 60); }));
    const mb = $('[data-featmore]'); if (mb) mb.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => menu.classList.add('is-open'));
  }
  function closeCatMenu() {
    const menu = $('.nx-catmenu'); if (menu) menu.classList.remove('is-open');
    const mb = $('[data-featmore]'); if (mb) mb.setAttribute('aria-expanded', 'false');
  }

  /* ============================================================
     Lightbox
     ============================================================ */
  function initLightbox() {
    let lb = $('#nx-lb');
    if (!lb) {
      lb = el('div', 'nx-lb'); lb.id = 'nx-lb';
      lb.innerHTML = '<div class="nx-lb__bd" data-close></div><div class="nx-lb__box"><button class="nx-lb__x" data-close>✕</button><div class="wf-img" data-lbimg style="width:100%;height:100%"><span class="wf-img__label" data-lblabel></span></div></div>';
      document.body.appendChild(lb);
      lb.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) lb.classList.remove('is-open'); });
    }
    document.addEventListener('click', e => {
      const z = e.target.closest('.nx-zoom');
      if (z && !e.target.closest('button') && !z.closest('#nx-features')) {
        $('[data-lblabel]', lb).textContent = (z.dataset.zoom || 'IMAGE') + ' · 放大檢視';
        lb.classList.add('is-open');
      }
    });
  }

  /* ---- play/stop 佔位按鈕（動畫播放示意）---- */
  function initPlay() {
    document.addEventListener('click', e => {
      const p = e.target.closest('[data-play]');
      if (!p) return;
      e.stopPropagation();
      const on = p.classList.toggle('is-playing');
      p.querySelector('.ic').textContent = on ? '❚❚' : '▶';
    });
  }

  /* ---- 重算 carousel 寬度（裝置切換時）---- */
  window.NXRecalc = function () { $$('.nx-car').forEach(c => c._recalc && c._recalc()); };

  /* ---- rebuild on optional-category change ---- */
  window.NXRebuildFeatures = function () { renderFeatures(); setTimeout(window.NXRecalc, 60); };

  function init() {
    renderHighlights();
    render360();
    renderFeatures();
    renderCompare();
    renderSpec();
    renderSpecEquip();
    wireSpecTabs();
    renderEquip();
    renderFaq();
    initLightbox();
    initPlay();
    setTimeout(window.NXRecalc, 80);
    window.addEventListener('resize', () => { clearTimeout(window._nxr); window._nxr = setTimeout(window.NXRecalc, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
