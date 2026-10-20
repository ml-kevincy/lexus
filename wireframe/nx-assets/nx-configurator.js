/* ============================================================
   NX 賞車選擇器 · Configurator 互動層
   ------------------------------------------------------------
   合併備註（Merge notes）
   1. 與 nx-configurator.css 自成一組，零外部相依（除 DS token / wf class）。
   2. 車款頁取代「360 賞車」段落時：放一個容器並呼叫
        NXConfigurator.renderEntry('#nx-selector')
      其餘（overlay、完成頁）由本檔自行掛載於 document.body。
   3. 裝置切換：頁面在 device 改變時呼叫 NXConfigurator.setDevice(dev)。
   4. 視角＝360 左右拖曳旋轉（連續 frame）。CONFIG 為示意資料，
      合併時可整段移入 nx-data.js（window.NXData.configurator）。
   ============================================================ */
(function () {
  'use strict';

  /* ---- 1 · 資料模型（示意；可移入 nx-data.js）-------------- */
  const EXT_COLORS = [
    { id: 'azure',    hex: '#7d97b5', name: '蒼映藍', spec: '旗艦版專屬' },
    { id: 'copper',   hex: '#9c6b43', name: '光焰銅', spec: '旗艦版專屬' },
    { id: 'white',    hex: '#f5f5f2', name: 'LFA白',  spec: '全車型適用' },
    { id: 'titanium', hex: '#837e78', name: '極光鈦', spec: '全車型適用' },
    { id: 'silver',   hex: '#bcbfc2', name: '星塵銀', spec: '全車型適用' },
    { id: 'gray',     hex: '#54565e', name: '星耀灰', spec: '全車型適用' },
    { id: 'black',    hex: '#0c0c0d', name: '星熠黑', spec: '全車型適用' },
  ];
  const WHEELS = [
    { id: 'w18', name: '18吋 銳切雙色鋁圈', en: '18" TWO-TONE' },
  ];
  const INT_COLORS = [
    { id: 'ivory', hex: '#e7e2d8', name: '煥映白', en: 'IVORY WHITE' },
    { id: 'black', hex: '#1c1f24', name: '尊爵黑', en: 'NOBLE BLACK' },
    { id: 'brown', hex: '#7a5a36', name: '金耀棕', en: 'GOLDEN BROWN' },
  ];
  const TRIMS = [
    { id: 'art', name: '竹韻光雕', en: 'BAMBOO', hex: '#9a9488' },
  ];
  // 版本為 gate：限定後續每步可選範圍
  const VERSIONS = [
    { id: '500e', name: 'ES 500e', power: 'BEV 純電', diff: '純電動力 · 前後雙馬達四驅', price: 'NT$ 205 萬',
      colors: ['azure','copper','white','titanium','silver','gray','black'],
      wheels: ['w18'], intColors: ['ivory','black','brown'], trims: ['art'] },
    { id: '300h', name: 'ES 300h', power: 'HEV 油電', diff: '油電混合 · 高效能低油耗', price: 'NT$ 197 萬',
      colors: ['white','titanium','silver','gray','black'],
      wheels: ['w18'], intColors: ['black','brown'], trims: ['art'] },
  ];

  // 360 視角：連續 frame（拖曳旋轉）。外觀整圈、內裝半圈示意
  const EXT_FRAMES = 24, INT_FRAMES = 12;
  // 步驟自動聚焦：切到對應視角與旋轉位置
  const STEPS = [
    { id: 'version',  label: '車型版本', short: '車型', en: 'VERSION',  view: 'ext', frame: 0,  interior: false,
      desc: '先選版本。版本決定後續可選的車色、輪圈與內裝範圍。' },
    { id: 'extColor', label: '外觀色系', short: '外觀', en: 'EXTERIOR', view: 'ext', frame: 6,  interior: false,
      desc: '選擇外觀車色，左右拖曳即可 360 旋轉檢視。' },
    { id: 'wheel',    label: '鋁圈', short: '輪圈', en: 'WHEEL',    view: 'ext', frame: 3,  interior: false, detail: '輪圈特寫',
      desc: '選擇輪圈樣式，鏡頭自動帶到輪圈視角。' },
    { id: 'intColor', label: '內裝色系', short: '內裝', en: 'INTERIOR', view: 'int', frame: 0,  interior: true,
      desc: '舞台切換至內裝視角，左右拖曳檢視座艙。' },
    { id: 'trim',     label: '飾板色系', short: '飾版', en: 'TRIM',     view: 'int', frame: 4,  interior: true, detail: '飾板特寫',
      desc: '選擇飾板材質，鏡頭自動帶到飾板區。' },
  ];

  /* ---- 2 · 工具 ------------------------------------------- */
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const byId = (arr, id) => arr.find(x => x.id === id);
  const ver = () => byId(VERSIONS, state.version);
  const device = () => (window.__wf && window.__wf.device) || 'desktop';

  const state = {
    version: '500e', extColor: 'white', wheel: 'w18', intColor: 'ivory', trim: 'art',
    step: 0, view: 'ext', frameExt: 0, frameInt: 0, frameTrim: 0, detail: null, mode: 'config',
  };
  let overlay = null, entryMount = null;

  const extName = () => (byId(EXT_COLORS, state.extColor) || {}).name || '—';
  const extHex  = () => (byId(EXT_COLORS, state.extColor) || {}).hex || '#ccc';
  const wheelObj = () => byId(WHEELS, state.wheel) || {};
  const intName = () => (byId(INT_COLORS, state.intColor) || {}).name || '—';
  const intHex  = () => (byId(INT_COLORS, state.intColor) || {}).hex || '#ccc';
  const trimObj = () => byId(TRIMS, state.trim) || {};

  const framesOf = (view) => view === 'ext' ? EXT_FRAMES : INT_FRAMES;
  const curFrame = (view) => view === 'ext' ? state.frameExt : view === 'trim' ? state.frameTrim : state.frameInt;
  function setFrame(view, f) {
    const n = framesOf(view); f = ((Math.round(f) % n) + n) % n;
    if (view === 'ext') state.frameExt = f; else if (view === 'trim') state.frameTrim = f; else state.frameInt = f;
  }
  // frame → 視角名稱
  function angleInfo(view, frame) {
    if (view === 'ext') {
      const cn = ['正前', '前 3/4', '側面', '後 3/4', '正後', '後 3/4', '側面', '前 3/4'];
      const en = ['FRONT', 'FRONT 3/4', 'SIDE', 'REAR 3/4', 'REAR', 'REAR 3/4', 'SIDE', 'FRONT 3/4'];
      const i = Math.round(frame / EXT_FRAMES * 8) % 8;
      return { cn: cn[i], en: en[i] };
    }
    if (view === 'trim') {
      const cn = ['中控飾板', '門板飾板', '排檔飾板', '前座飾板'];
      const en = ['DASH TRIM', 'DOOR TRIM', 'CONSOLE TRIM', 'SEAT TRIM'];
      const i = Math.round(frame / INT_FRAMES * 4) % 4;
      return { cn: cn[i], en: en[i] };
    }
    const cn = ['中控台', '前座艙', '中央扶手', '後座', '飾板', '車門板'];
    const en = ['DASH', 'CABIN', 'CONSOLE', 'REAR', 'TRIM', 'DOOR'];
    const i = Math.round(frame / INT_FRAMES * 6) % 6;
    return { cn: cn[i], en: en[i] };
  }

  // 版本切換 → 重新框定可選範圍 + 套用預設（gate）
  function applyVersionGate() {
    const v = ver(); const changed = [];
    if (v.colors.indexOf(state.extColor) === -1) { state.extColor = v.colors[0]; changed.push('外觀色'); }
    if (v.wheels.indexOf(state.wheel) === -1) { state.wheel = v.wheels[0]; changed.push('輪圈'); }
    if (v.intColors.indexOf(state.intColor) === -1) { state.intColor = v.intColors[0]; changed.push('內裝色'); }
    if (v.trims.indexOf(state.trim) === -1) { state.trim = v.trims[0]; changed.push('飾板'); }
    return changed;
  }

  /* ---- 3 · 舞台（圖層合成 + 360 拖曳旋轉）----------------- */
  // view 固定（'ext' / 'int'）。回傳 wrap，內含可拖曳車圖 + 旋轉刻度軸 + 圖層註解
  function buildStage(view) {
    const wrap = el('div', 'nxc-stage-wrap'); wrap.dataset.view = view;
    const canvas = el('div', 'nxc-canvas');
    canvas.innerHTML =
      '<div class="wf-img wf-img--plain" data-stageimg>' +
        '<span class="wf-img__label" data-stagelabel></span>' +
        '<button class="nxc-stage__zoom" data-zoom><span class="ic">⤢</span> 放大看細節</button>' +
      '</div>';
    // 旋轉刻度軸
    wrap.appendChild(canvas);

    canvas.querySelector('[data-zoom]').addEventListener('click', openZoom);
    return wrap;
  }

  // 在車圖上左右拖曳 → 旋轉 frame
  function attachDrag(wrap, view) {
    const imgEl = wrap.querySelector('[data-stageimg]');
    let dragging = false, lastX = 0, acc = 0;
    const step = () => Math.max(10, (imgEl.clientWidth || 320) / framesOf(view));
    imgEl.addEventListener('pointerdown', e => {
      if (e.target.closest('[data-zoom]')) return;
      dragging = true; lastX = e.clientX; acc = 0; imgEl.classList.add('is-drag');
      imgEl.setPointerCapture(e.pointerId);
    });
    imgEl.addEventListener('pointermove', e => {
      if (!dragging) return;
      acc += (e.clientX - lastX); lastX = e.clientX;
      const s = step();
      while (Math.abs(acc) >= s) {
        setFrame(view, curFrame(view) + (acc > 0 ? 1 : -1));
        acc += acc > 0 ? -s : s;
        paintStage(wrap, view);
      }
    });
    const end = () => { dragging = false; imgEl.classList.remove('is-drag'); };
    imgEl.addEventListener('pointerup', end);
    imgEl.addEventListener('pointercancel', end);
  }

  // 依目前 state 更新舞台（含淡入回饋）
  function paintStage(wrap, view) {
    const interior = view === 'int' || view === 'trim';
    const frame = curFrame(view);
    const ang = angleInfo(view, frame);
    const v = ver();
    const imgEl = wrap.querySelector('[data-stageimg]');
    const labelEl = wrap.querySelector('[data-stagelabel]');

    if (view === 'trim') {
      labelEl.textContent = v.name + ' · ' + ang.cn + ' · ' + trimObj().name;
    } else if (interior) {
      labelEl.textContent = v.name + ' · ' + ang.cn + ' · ' + intName() + ' · ' + trimObj().name;
    } else {
      labelEl.textContent = v.name + ' · ' + ang.cn + ' · ' + extName() + ' · ' + wheelObj().en;
    }

    imgEl.classList.remove('nxc-fade'); void imgEl.offsetWidth; imgEl.classList.add('nxc-fade');
    if (state._onFrame) state._onFrame();
  }

  /* ---- 4 · 車款頁入口卡 ----------------------------------- */
  function renderEntry(sel) {
    entryMount = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!entryMount) return;
    entryMount.innerHTML = '';

    const root = el('div', 'nxc-entry');
    const stageCol = el('div', 'nxc-entry__stage');
    state.view = 'ext';
    const stageWrap = buildStage('ext');
    stageCol.appendChild(stageWrap);

    // 置中色票列 + 選中色名
    const picker = el('div', 'nxc-entry__picker');
    const sw = el('div', 'nxc-swatches'); sw.dataset.entrySw = '1';
    const cname = el('div', 'nxc-entry__cname'); cname.dataset.cname = '1';
    const cspec = el('div', 'nxc-entry__cspec'); cspec.dataset.cspec = '1';
    picker.appendChild(sw);
    picker.appendChild(cname);
    picker.appendChild(cspec);

    const ctaWrap = el('div', 'nxc-entry__cta');
    const cta = el('button', 'wf-btn wf-btn--primary', '自訂我的 ES ›');
    cta.addEventListener('click', () => open());
    ctaWrap.appendChild(cta);

    root.appendChild(stageCol);
    root.appendChild(picker);
    root.appendChild(ctaWrap);
    entryMount.appendChild(root);

    function paintEntrySwatches() {
      const v = ver(); sw.innerHTML = '';
      v.colors.forEach(cid => {
        const c = byId(EXT_COLORS, cid);
        const item = el('button', 'nxc-sw');
        item.innerHTML = '<span class="nxc-sw__dot" style="background:' + c.hex + '"></span>';
        item.setAttribute('aria-selected', cid === state.extColor ? 'true' : 'false');
        item.title = c.name;
        item.addEventListener('click', () => {
          state.extColor = cid; setFrame('ext', 6); // 轉到側面
          paintEntrySwatches();
          paintStage(stageWrap, 'ext');
        });
        sw.appendChild(item);
      });
      const c = byId(EXT_COLORS, state.extColor) || {};
      cname.textContent = c.name || '—';
      cspec.textContent = c.spec ? '（' + c.spec + '）' : '';
    }
    paintEntrySwatches();
    paintStage(stageWrap, 'ext');
    entryMount._repaint = () => { paintEntrySwatches(); paintStage(stageWrap, 'ext'); };
  }

  /* ---- 4b · 車款頁 FLAT 直選（第一層）---------------------
     手機：上方大圖 + 下方選項按鈕；點按鈕 → BottomSheet，按 DONE/✕
           關閉時才換上方大圖。
     平板／桌機：左大圖 + 縮圖列；右側手風琴（一次一張），點了即時換圖。
     共用 optionCards() 產生選項卡。 */
  function railVal(id) {
    return id === 'version' ? ver().name
      : id === 'extColor' ? extName()
      : id === 'wheel' ? wheelObj().name
      : id === 'intColor' ? intName()
      : trimObj().name;
  }
  function curVal(id) {
    return id === 'version' ? state.version
      : id === 'extColor' ? state.extColor
      : id === 'wheel' ? state.wheel
      : id === 'intColor' ? state.intColor
      : state.trim;
  }
  function stepFor(id) { return STEPS.find(x => x.id === id); }
  function setStateCat(id, val) {
    if (id === 'version') state.version = val;
    else if (id === 'extColor') state.extColor = val;
    else if (id === 'wheel') state.wheel = val;
    else if (id === 'intColor') state.intColor = val;
    else state.trim = val;
  }

  function verCardHTML(v) {
    return '<div class="nxc-opt__vtop"><span class="nxc-opt__name">' + v.name + '</span>' +
      '<span class="wf-tag">' + v.power.split(' ')[0] + '</span></div>' +
      '<span class="nxc-opt__diff">' + v.diff + '</span>' +
      '<span class="nxc-opt__price">' + v.price + '</span>';
  }
  function swCardHTML(c) {
    return '<span class="nxc-opt__block" style="background:' + c.hex + '"></span>' +
      '<span class="nxc-opt__name">' + c.name + '</span>' +
      (c.spec ? '<span class="nxc-opt__sub">' + c.spec + '</span>' : '');
  }
  function intCardHTML(c) {
    return '<span class="wf-img nxc-opt__img" style="background:' + c.hex + '"><span class="wf-img__label">' + c.en + '</span></span>' +
      '<span class="nxc-opt__name">' + c.name + '</span>';
  }
  function thumbCardHTML(t) {
    return '<span class="wf-img nxc-opt__img"><span class="wf-img__label">' + t.en + '</span></span>' +
      '<span class="nxc-opt__name">' + t.name + '</span>';
  }

  // 共用選項卡。getSel()＝目前（或暫存）選值；onSel(id)＝點選回呼。
  function optionCards(catId, getSel, onSel) {
    const box = el('div', 'nxc-opts nxc-opts--' + catId);
    function refresh() {
      box.querySelectorAll('[data-id]').forEach(n =>
        n.setAttribute('aria-selected', n.dataset.id === getSel() ? 'true' : 'false'));
    }
    function add(id, html) {
      const it = el('button', 'nxc-opt');
      it.dataset.id = id; it.innerHTML = html;
      it.setAttribute('aria-selected', id === getSel() ? 'true' : 'false');
      it.addEventListener('click', () => { onSel(id); refresh(); });
      box.appendChild(it);
    }
    if (catId === 'version') VERSIONS.forEach(v => add(v.id, verCardHTML(v)));
    else if (catId === 'extColor') ver().colors.forEach(cid => add(cid, swCardHTML(byId(EXT_COLORS, cid))));
    else if (catId === 'intColor') ver().intColors.forEach(cid => add(cid, intCardHTML(byId(INT_COLORS, cid))));
    else {
      const isW = catId === 'wheel';
      (isW ? ver().wheels : ver().trims).forEach(tid => add(tid, thumbCardHTML(byId(isW ? WHEELS : TRIMS, tid))));
    }
    box._refresh = refresh;
    return box;
  }

  // 放大檢視（全螢幕車款重點）：沿用 reveal 版型；✕／繼續自訂皆回到頁面
  function openReveal() {
    ensureOverlay();
    overlay.dataset.device = device();
    setScreenWidth();
    renderReveal(close);
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.documentElement.style.overflow = 'hidden';
  }

  let flatCtx = null;

  function renderFlat(sel) {
    const mount = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!mount) return;
    entryMount = mount;
    if (!state.view) state.view = 'ext';
    flatCtx = { sel: sel, mount: mount, dev: device() };
    drawFlat(mount);
  }

  function drawFlat(mount) {
    mount.innerHTML = '';
    const split = device() === 'desktop';

    const root = el('div', 'nxc-flat'); root.dataset.mode = split ? 'split' : 'mobile';
    const top = el('div', 'nxc-flat__top');
    const left = el('div', 'nxc-flat__left');
    const stageHost = el('div', 'nxc-flat__stage');
    const imgnav = el('div', 'nxc-flat__imgnav');
    const controls = el('div', 'nxc-flat__controls');
    const summary = el('div', 'nxc-flat__summary');
    const belowStage = el('div', 'nxc-flat__belowstage');
    const swname = el('div', 'nxc-flat__swname');
    const swrow = el('div', 'nxc-flat__swrow');
    left.appendChild(stageHost); left.appendChild(belowStage);
    belowStage.appendChild(swname);
    belowStage.appendChild(swrow);
    top.appendChild(buildVersionPicker()); /* 車型下拉（pill 樣式）*/
    root.appendChild(top); root.appendChild(left);
    mount.appendChild(root);

    let stageWrap = null;
    let openCat = null;
    let togEl = null;

    function mountStage() {
      if (stageWrap) stageWrap.remove();
      stageWrap = buildStage(state.view);
      const canvas = stageWrap.querySelector('.nxc-canvas');
      const z = canvas.querySelector('.nxc-stage__zoom'); if (z) z.remove();
      const tog = el('div', 'nxc-flat__viewtog');
      tog.innerHTML =
        '<button data-vt="ext"' + (state.view === 'ext' ? ' aria-selected="true"' : '') + '>外觀</button>' +
        '<button data-vt="int"' + (state.view === 'int' ? ' aria-selected="true"' : '') + '>內裝</button>' +
        '<button data-vt="trim"' + (state.view === 'trim' ? ' aria-selected="true"' : '') + '>飾板</button>';
      tog.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.vt; if (v === state.view) return;
        state.view = v; setFrame(v, v === 'ext' ? 6 : 0);
        repaintStage(); paintImageNav(); paintColorRow();
      }));
      if (togEl) togEl.remove();
      togEl = tog;
      belowStage.insertBefore(tog, swname);
      canvas.appendChild(imgnav);
      stageHost.appendChild(stageWrap);
      paintStage(stageWrap, state.view);
    }
    function repaintStage() {
      if (!stageWrap || stageWrap.dataset.view !== state.view) mountStage();
      else paintStage(stageWrap, state.view);
    }

    function paintImageNav() {
      imgnav.innerHTML = '';
      const count = 3;
      const frames = framesOf(state.view);
      const cur = ((Math.round(curFrame(state.view) / frames * count) % count) + count) % count;
      if (false) { // 桌機改用與手機／平板相同的圓點列
        const prev = el('button', 'nxc-imgnav__nav', '‹');
        const vp = el('div', 'nxc-imgnav__vp');
        const track = el('div', 'nxc-imgnav__track');
        const next = el('button', 'nxc-imgnav__nav', '›');
        vp.appendChild(track);
        for (let i = 0; i < count; i++) {
          const f = Math.round(i / count * frames);
          const ang = angleInfo(state.view, f);
          const th = el('button', 'nxc-thumb2' + (i === cur ? ' is-on' : ''));
          th.innerHTML = '<span class="wf-img wf-img--plain nxc-thumb2__img"><span class="wf-img__label">' + ang.en + '</span></span>';
          th.title = ang.cn;
          th.addEventListener('click', () => { setFrame(state.view, f); repaintStage(); paintImageNav(); });
          track.appendChild(th);
        }
        prev.addEventListener('click', () => vp.scrollBy({ left: -220, behavior: 'smooth' }));
        next.addEventListener('click', () => vp.scrollBy({ left: 220, behavior: 'smooth' }));
        imgnav.appendChild(prev); imgnav.appendChild(vp); imgnav.appendChild(next);
      } else {
        const prev = el('button', 'nxc-flat__arrow', '‹');
        const dotrow = el('div', 'nxc-flat__dots');
        const next = el('button', 'nxc-flat__arrow', '›');
        for (let i = 0; i < count; i++) {
          const f = Math.round(i / count * frames);
          const d = el('button', 'nxc-flat__dot' + (i === cur ? ' is-on' : ''));
          d.addEventListener('click', () => { setFrame(state.view, f); repaintStage(); paintImageNav(); });
          dotrow.appendChild(d);
        }
        const stepNav = (dir) => {
          const ni = ((cur + dir) % count + count) % count;
          setFrame(state.view, Math.round(ni / count * frames));
          repaintStage(); paintImageNav();
        };
        prev.addEventListener('click', () => stepNav(-1));
        next.addEventListener('click', () => stepNav(1));
        imgnav.appendChild(prev); imgnav.appendChild(dotrow); imgnav.appendChild(next);
      }
    }
    state._onFrame = paintImageNav;

    function paintSummary() {
      const v = ver();
      summary.innerHTML =
        '<div class="nxc-flat__sumline"><div><div class="nxc-flat__sumbrand">YOUR LEXUS</div>' +
        '<div class="nxc-flat__summodel">' + v.name + '</div></div>' +
        '<div class="nxc-flat__sumprice">' + v.price + ' 起</div></div>' +
        '<p class="nxc-flat__note">您喜歡眼前的 NX 嗎？將您的配置加入收藏，預約專人為您安排賞車與試乘。</p>' +
        '<div class="nxc-flat__cta">' +
        '<button class="wf-btn wf-btn--secondary">分享儲存</button>' +
        '<button class="wf-btn wf-btn--primary">預約試乘 ›</button></div>';
    }

    /* ---- 桌機／平板：手風琴（一次一張，即時換圖）---- */
    function refreshAccHeads() {
      controls.querySelectorAll('.nxc-acc').forEach(p => p._refreshHead && p._refreshHead());
    }
    function pickLive(catId, id) {
      if (catId === 'version') {
        if (id === state.version) return;
        state.version = id; applyVersionGate(); applyFocus(STEPS[0]);
      } else { setStateCat(catId, id); applyFocus(stepFor(catId)); }
      repaintStage(); paintImageNav(); paintSummary(); refreshAccHeads(); paintColorRow();
      if (catId === 'version' && openCat && openCat !== 'version') {
        const p = controls.querySelector('.nxc-acc[data-id="' + openCat + '"]');
        if (p) p._fill();
      }
    }
    function limitToTwoRows(body) {
      const grid = body.querySelector('.nxc-opts');
      if (!grid) return;
      const cards = Array.from(grid.children);
      if (cards.length < 3) return; // 兩列以內不需捲動
      const gridTop = grid.getBoundingClientRect().top;
      const tops = [];
      cards.forEach(c => {
        const t = c.getBoundingClientRect().top - gridTop;
        if (!tops.some(v => Math.abs(v - t) < 2)) tops.push(t);
      });
      if (tops.length < 3) return; // 實際不足三列
      tops.sort((a, b) => a - b);
      const cs = getComputedStyle(body);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padBot = parseFloat(cs.paddingBottom) || 0;
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
      // 以第三列頂端為界，保留兩列
      body.style.maxHeight = (padTop + tops[2] - gap / 2 + padBot) + 'px';
      body.style.overflowY = 'auto';
    }
    function accPanel(catId) {
      const s = stepFor(catId);
      const panel = el('section', 'nxc-acc'); panel.dataset.id = catId;
      const head = el('button', 'nxc-acc__head');
      head.innerHTML =
        '<div class="nxc-acc__htext"><span class="wf-eyebrow">' + s.en + '</span><h4>' + s.label + '</h4></div>' +
        '<span class="nxc-acc__hval" data-hval>' + railVal(catId) + '</span>' +
        '<span class="nxc-acc__chev">˅</span>';
      const body = el('div', 'nxc-acc__body');
      panel.appendChild(head); panel.appendChild(body);
      panel._refreshHead = () => { head.querySelector('[data-hval]').textContent = railVal(catId); };
      panel._fill = () => {
        body.innerHTML = '';
        body.appendChild(optionCards(catId, () => curVal(catId), (id) => pickLive(catId, id)));
        body.style.maxHeight = '';
        body.style.overflowY = '';
        if (split) requestAnimationFrame(() => limitToTwoRows(body));
      };
      head.addEventListener('click', () => {
        if (openCat === catId) { openCat = null; panel.classList.remove('is-open'); body.innerHTML = ''; return; }
        if (openCat) {
          const prev = controls.querySelector('.nxc-acc[data-id="' + openCat + '"]');
          if (prev) { prev.classList.remove('is-open'); prev.querySelector('.nxc-acc__body').innerHTML = ''; }
        }
        openCat = catId; panel._fill(); panel.classList.add('is-open');
      });
      return panel;
    }

    /* ---- 手機：選項按鈕 + BottomSheet（DONE 才換圖）---- */
    function refreshButtons() {
      controls.querySelectorAll('.nxc-btn[data-id]').forEach(b => {
        const v = b.querySelector('[data-val]'); if (v) v.textContent = railVal(b.dataset.id);
      });
    }
    function catButton(id) {
      const s = stepFor(id);
      const b = el('button', 'nxc-btn' + (id === 'version' ? ' nxc-btn--wide' : ''));
      b.dataset.id = id;
      b.innerHTML =
        '<span class="nxc-btn__lbl">' + s.label + '</span>' +
        '<span class="nxc-btn__val" data-val>' + railVal(id) + '</span>' +
        '<span class="nxc-btn__chev">' + (id === 'version' ? '˅' : '›') + '</span>';
      b.addEventListener('click', () => openSheet(id));
      return b;
    }
    function openSheet(catId) {
      const s = stepFor(catId);
      let staged = curVal(catId);
      const sheet = el('div', 'nxc-sheet nxc-sheet--' + device());
      sheet.style.setProperty('--nxc-w', ((window.WF_WIDTHS && window.WF_WIDTHS[device()]) || 390) + 'px');
      const col = el('div', 'nxc-sheet__col');
      const panel = el('div', 'nxc-sheet__panel');
      const head = el('div', 'nxc-sheet__head');
      head.innerHTML =
        '<div class="nxc-sheet__grab"></div>' +
        '<div class="nxc-sheet__htext"><span class="wf-eyebrow">' + s.en + '</span><h4>' + s.label + '</h4></div>' +
        '<button class="nxc-sheet__x" aria-label="關閉">✕</button>';
      const bodyWrap = el('div', 'nxc-sheet__body');
      bodyWrap.appendChild(optionCards(catId, () => staged, (id) => { staged = id; }));
      const foot = el('div', 'nxc-sheet__foot');
      const done = el('button', 'wf-btn wf-btn--primary', 'DONE');
      foot.appendChild(done);
      panel.appendChild(head); panel.appendChild(bodyWrap); panel.appendChild(foot);
      col.appendChild(panel); sheet.appendChild(col);
      document.body.appendChild(sheet);
      requestAnimationFrame(() => sheet.classList.add('is-open'));
      document.documentElement.style.overflow = 'hidden';

      function applyClose() {
        setStateCat(catId, staged);
        if (catId === 'version') applyVersionGate();
        applyFocus(stepFor(catId)); // 切視角 + 角度 → 關閉時才換上方大圖
        repaintStage(); paintImageNav(); paintSummary(); refreshButtons(); paintColorRow();
        sheet.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        setTimeout(() => sheet.remove(), 320);
      }
      head.querySelector('.nxc-sheet__x').addEventListener('click', applyClose);
      done.addEventListener('click', applyClose);
      sheet.addEventListener('click', e => { if (e.target === sheet) applyClose(); });
    }

    function buildControls() {
      controls.innerHTML = '';
      if (split) {
        ['version'].forEach(id => controls.appendChild(accPanel(id)));
      } else {
        const grid = el('div', 'nxc-btns');
        ['version'].forEach(id => grid.appendChild(catButton(id)));
        controls.appendChild(grid);
      }
    }

    function buildVersionPicker() {
      const wrap = el('div', 'nxc-vpick');
      const trigger = el('button', 'nxc-vpick__trigger');
      const menu = el('div', 'nxc-vpick__menu');
      function renderTrigger() {
        trigger.innerHTML =
          '<span class="nxc-vpick__lbl">車型版本</span>' +
          '<span class="nxc-vpick__val">' + ver().name + '</span>' +
          '<span class="nxc-vpick__chev" aria-hidden="true">˅</span>';
      }
      function renderMenu() {
        menu.innerHTML = '';
        VERSIONS.forEach(v => {
          const it = el('button', 'nxc-vpick__opt',
            '<span class="nxc-vpick__optname">' + v.name + '</span>' +
            '<span class="nxc-vpick__optsub">' + v.power + '</span>');
          it.setAttribute('aria-selected', v.id === state.version ? 'true' : 'false');
          it.addEventListener('click', (e) => {
            e.stopPropagation();
            wrap.classList.remove('is-open');
            if (v.id === state.version) return;
            state.version = v.id; applyVersionGate(); applyFocus(STEPS[0]);
            renderTrigger(); renderMenu();
            repaintStage(); paintImageNav(); paintColorRow();
            if (split) refreshAccHeads(); else refreshButtons();
          });
          menu.appendChild(it);
        });
      }
      trigger.addEventListener('click', (e) => { e.stopPropagation(); wrap.classList.toggle('is-open'); });
      document.addEventListener('click', () => wrap.classList.remove('is-open'));
      renderTrigger(); renderMenu();
      wrap.appendChild(trigger); wrap.appendChild(menu);
      return wrap;
    }

    function paintColorRow() {
      swrow.innerHTML = '';
      const v = ver();
      let ids, pool, sel;
      if (state.view === 'int') { ids = v.intColors; pool = INT_COLORS; sel = state.intColor; }
      else if (state.view === 'trim') { ids = v.trims; pool = TRIMS; sel = state.trim; }
      else { ids = v.colors; pool = EXT_COLORS; sel = state.extColor; }
      swname.textContent = (byId(pool, sel) || {}).name || '';
      ids.forEach(id => {
        const c = byId(pool, id) || {};
        const b = el('button', 'nxc-flat__sw',
          '<span class="nxc-flat__swdot" style="background:' + (c.hex || '#9a9488') + '"></span>');
        b.title = c.name || '';
        b.setAttribute('aria-selected', id === sel ? 'true' : 'false');
        b.addEventListener('click', () => {
          if (state.view === 'int') state.intColor = id;
          else if (state.view === 'trim') state.trim = id;
          else state.extColor = id;
          paintColorRow(); repaintStage();
          if (split) refreshAccHeads(); else refreshButtons();
        });
        swrow.appendChild(b);
      });
    }

    mountStage();
    paintImageNav();
    paintColorRow();
    buildControls();
    paintSummary();
    if (split) {
      const p = controls.querySelector('.nxc-acc[data-id="extColor"]');
      if (p) { openCat = 'extColor'; p._fill(); p.classList.add('is-open'); }
    }
    mount._repaint = () => {
      repaintStage(); paintImageNav(); paintSummary(); paintColorRow();
      if (split) refreshAccHeads(); else refreshButtons();
    };
  }

  /* ---- 5 · 全螢幕 OVERLAY 狀態機 -------------------------- */
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = el('div', 'nxc-overlay');
    overlay.dataset.device = device();
    overlay.innerHTML = '<div class="nxc-screen"><div class="nxc-toast" data-toast></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    setScreenWidth();
    return overlay;
  }
  function setScreenWidth() {
    const W = (window.WF_WIDTHS || { mobile: 390, tablet: 834, desktop: 1440 });
    overlay.querySelector('.nxc-screen').style.setProperty('--nxc-w', (W[device()] || 1440) + 'px');
  }

  function open() {
    ensureOverlay();
    state.step = 0; state.mode = 'config';
    renderConfig();
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    if (entryMount && entryMount._repaint) entryMount._repaint();
  }

  // 套用某步驟的自動聚焦（視角 + 旋轉位置）
  function applyFocus(s) {
    state.view = s.view; state.detail = s.detail || null;
    setFrame(s.view, s.frame);
  }

  // 渲染「設定」狀態（步驟流程）
  function renderConfig() {
    const screen = overlay.querySelector('.nxc-screen');
    const toast = screen.querySelector('[data-toast]');
    screen.innerHTML = ''; screen.appendChild(toast);

    const stepObj = STEPS[state.step];
    applyFocus(stepObj); // 自動聚焦

    const bar = el('div', 'nxc-bar');
    bar.innerHTML =
      '<button class="nxc-bar__x" data-x aria-label="關閉">✕</button>';
    bar.querySelector('[data-x]').addEventListener('click', close);
    screen.appendChild(bar);

    const body = el('div', 'nxc-body');
    const stagecol = el('div', 'nxc-stagecol');
    const inner = el('div', 'nxc-stage-inner');
    const stageWrap = buildStage(stepObj.view);
    inner.appendChild(stageWrap);
    stagecol.appendChild(inner);

    const panel = el('div', 'nxc-panel');
    panel.appendChild(buildSteps());
    panel.appendChild(buildStepContent(stageWrap));
    body.appendChild(stagecol);
    body.appendChild(panel);
    screen.appendChild(body);

    const foot = el('div', 'nxc-foot');
    const back = el('button', 'wf-btn wf-btn--secondary wf-btn--sm nxc-foot__btn', '關閉');
    back.addEventListener('click', close);
    const sp = el('span', 'sp');
    const done = el('button', 'wf-btn wf-btn--primary wf-btn--sm nxc-foot__btn', '完成自訂');
    done.addEventListener('click', renderReveal);
    foot.appendChild(back); foot.appendChild(sp); foot.appendChild(done);
    screen.appendChild(foot);

    paintStage(stageWrap, stepObj.view);
  }

  function buildSteps() {
    const row = el('div', 'nxc-steps');
    STEPS.forEach((s, i) => {
      const st = i === state.step ? 'current' : (i < state.step ? 'done' : 'todo');
      const b = el('button', 'nxc-step', s.short);
      b.dataset.state = st;
      b.addEventListener('click', () => { state.step = i; renderConfig(); });
      row.appendChild(b);
    });
    return row;
  }

  function buildStepContent(stageWrap) {
    const s = STEPS[state.step];
    const view = s.view;
    const box = el('div', 'nxc-stepc');
    box.innerHTML =
      '<div class="nxc-stepc__head"><h4>' + s.label + '</h4></div>';
    const repaint = () => paintStage(stageWrap, view);

    if (s.id === 'version') {
      const grid = el('div', 'nxc-vcards');
      VERSIONS.forEach(v => {
        const card = el('button', 'nxc-vcard');
        card.setAttribute('aria-selected', v.id === state.version ? 'true' : 'false');
        card.innerHTML =
          '<div class="nxc-vcard__top"><span class="nxc-vcard__name">' + v.name + '</span>' +
          '<span class="wf-tag">' + v.power.split(' ')[0] + '</span></div>' +
          '<span class="nxc-vcard__diff">' + v.diff + '</span>';
        card.addEventListener('click', () => {
          if (v.id === state.version) return;
          state.version = v.id;
          const changed = applyVersionGate();
          grid.querySelectorAll('.nxc-vcard').forEach((c, idx) =>
            c.setAttribute('aria-selected', VERSIONS[idx].id === state.version ? 'true' : 'false'));
          repaint();
          if (changed.length) showToast('已套用 <b>' + v.name + '</b>，' + changed.join('、') + '已重設為可選範圍預設');
          else showToast('已切換至 <b>' + v.name + '</b>');
        });
        grid.appendChild(card);
      });
      box.appendChild(grid);

    } else if (s.id === 'extColor') {
      // 外觀配色：參照入口完整 10 色，一列兩個、加寬色框
      const grid = el('div', 'nxc-swatches nxc-swatches--2col');
      EXT_COLORS.forEach(c => {
        const item = el('button', 'nxc-sw',
          '<span class="nxc-sw__dot" style="background:' + c.hex + '"></span>' +
          '<span class="nxc-sw__name">' + c.name + '</span>' +
          (c.spec ? '<span class="nxc-sw__spec">' + c.spec + '</span>' : ''));
        item.setAttribute('aria-selected', c.id === state.extColor ? 'true' : 'false');
        item.addEventListener('click', () => {
          state.extColor = c.id;
          grid.querySelectorAll('.nxc-sw').forEach((n, idx) =>
            n.setAttribute('aria-selected', EXT_COLORS[idx].id === state.extColor ? 'true' : 'false'));
          repaint();
        });
        grid.appendChild(item);
      });
      box.appendChild(grid);

    } else if (s.id === 'intColor') {
      // 內裝配色：參照輪圈，圖片 + 圖說卡片
      const allowed = ver().intColors;
      const grid = el('div', 'nxc-thumbs');
      allowed.forEach(cid => {
        const c = byId(INT_COLORS, cid);
        const card = el('button', 'nxc-thumb');
        card.setAttribute('aria-selected', cid === state.intColor ? 'true' : 'false');
        card.innerHTML =
          '<div class="wf-img" style="background:' + c.hex + '"><span class="wf-img__label">' + c.en + '</span></div>' +
          '<span class="nxc-thumb__name">' + c.name + '</span>' +
          '<span class="nxc-thumb__en">' + c.en + '</span>';
        card.addEventListener('click', () => {
          state.intColor = cid;
          grid.querySelectorAll('.nxc-thumb').forEach((n, idx) =>
            n.setAttribute('aria-selected', allowed[idx] === state.intColor ? 'true' : 'false'));
          repaint();
        });
        grid.appendChild(card);
      });
      box.appendChild(grid);

    } else if (s.id === 'wheel' || s.id === 'trim') {
      const isWheel = s.id === 'wheel';
      const pool = isWheel ? WHEELS : TRIMS;
      const allowed = isWheel ? ver().wheels : ver().trims;
      const grid = el('div', 'nxc-thumbs');
      allowed.forEach(tid => {
        const t = byId(pool, tid);
        const card = el('button', 'nxc-thumb');
        card.setAttribute('aria-selected', tid === (isWheel ? state.wheel : state.trim) ? 'true' : 'false');
        card.innerHTML =
          '<div class="wf-img"><span class="wf-img__label">' + t.en + '</span></div>' +
          '<span class="nxc-thumb__name">' + t.name + '</span>' +
          '<span class="nxc-thumb__en">' + t.en + '</span>';
        card.addEventListener('click', () => {
          if (isWheel) state.wheel = tid; else state.trim = tid;
          grid.querySelectorAll('.nxc-thumb').forEach((n, idx) =>
            n.setAttribute('aria-selected', allowed[idx] === (isWheel ? state.wheel : state.trim) ? 'true' : 'false'));
          repaint();
        });
        grid.appendChild(card);
      });
      box.appendChild(grid);
    }
    return box;
  }

  function showToast(html) {
    const t = overlay.querySelector('[data-toast]');
    if (!t) return;
    t.innerHTML = html; t.classList.add('is-show');
    clearTimeout(t._tmr);
    t._tmr = setTimeout(() => t.classList.remove('is-show'), 2600);
  }

  /* ---- 6 · 完成 / 揭曉（全幅車圖 + 上層資訊）-------------- */
  function renderReveal(onEdit) {
    const editFn = onEdit || function () { state.mode = 'config'; renderConfig(); };
    state.mode = 'reveal';
    state.view = 'ext'; state.detail = null; setFrame('ext', 6);
    const screen = overlay.querySelector('.nxc-screen');
    const toast = screen.querySelector('[data-toast]');
    screen.innerHTML = ''; screen.appendChild(toast);

    // 頂列：關閉 + 繼續調整（浮在車圖上）
    const bar = el('div', 'nxc-bar nxc-bar--float');
    bar.innerHTML =
      '<button class="nxc-bar__x" data-x aria-label="關閉">✕</button>';
    bar.querySelector('[data-x]').addEventListener('click', close);

    // 全幅車圖
    const reveal = el('div', 'nxc-reveal');
    const photo = el('div', 'wf-img wf-img--plain nxc-reveal__photo');
    photo.innerHTML = '<span class="wf-img__label">' + ver().name + ' · ' + extName() + ' · 側面 KEY VISUAL</span>';

    // 上層資訊：車款 / 車型 / 售價 / 所選規格
    const overlayInfo = el('div', 'nxc-reveal__overlay');
    const specPairs = [
      ['外觀配色', extName()],
      ['內裝配色', intName()],
      ['內裝飾板', trimObj().name],
      ['動力型式', ver().power],
    ];
    overlayInfo.innerHTML =
      '<div class="nxc-reveal__brand">LEXUS</div>' +
      '<div class="nxc-reveal__model">' + ver().name + '</div>' +
      '<div class="nxc-reveal__price">' + ver().price + ' 起</div>' +
      '<div class="nxc-reveal__specs">' +
        specPairs.map(([k, v]) =>
          '<div class="nxc-reveal__spec"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'
        ).join('') +
      '</div>';

    reveal.appendChild(photo);
    reveal.appendChild(bar);
    reveal.appendChild(overlayInfo);

    // 底部兩顆按鈕
    const cta = el('div', 'nxc-reveal__cta');
    const closeBtn = el('button', 'wf-btn wf-btn--secondary', '關閉');
    closeBtn.addEventListener('click', close);
    cta.appendChild(closeBtn);
    cta.appendChild(el('button', 'wf-btn wf-btn--primary', '預約試乘 ›'));

    screen.appendChild(reveal);
    screen.appendChild(cta);
  }

  /* ---- 6b · 檢視我的 ES（海報式車卡 + 分享）--------------- */
  function openPoster() {
    ensureOverlay();
    overlay.dataset.device = device();
    setScreenWidth();
    state.mode = 'poster';
    renderPoster();
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.documentElement.style.overflow = 'hidden';
  }

  function renderPoster() {
    const screen = overlay.querySelector('.nxc-screen');
    const toast = screen.querySelector('[data-toast]');
    screen.innerHTML = ''; screen.appendChild(toast);

    const v = ver();
    const hl = (window.NXData && window.NXData.highlights) || [];
    // 車卡規格：外觀配色置頂 + 上方重點規格
    const specs = [{ k: '外觀配色', v: extName() }].concat(hl.map(h => ({ k: h.title, v: h.text })));

    const card = el('div', 'nxc-poster');
    // 頂列關閉
    const bar = el('div', 'nxc-poster__bar');
    bar.innerHTML = '<button class="nxc-bar__x" data-x aria-label="關閉">✕</button>';
    bar.querySelector('[data-x]').addEventListener('click', close);

    // 主視覺：背景字標 + 車圖（依所選外觀色淡染）
    const hero = el('div', 'nxc-poster__hero');
    hero.innerHTML =
      '<span class="nxc-poster__wordmark" aria-hidden="true">LEXUS</span>' +
      '<span class="nxc-poster__eyebrow">LEXUS · ES</span>' +
      '<div class="wf-img wf-img--plain nxc-poster__photo" style="--tint:' + extHex() + '">' +
        '<span class="wf-img__label">' + v.name + ' · ' + extName() + ' · 側面 KEY VISUAL</span>' +
      '</div>';

    // 車名 + 色票 + 售價
    const head = el('div', 'nxc-poster__head');
    head.innerHTML =
      '<div class="nxc-poster__brand">LEXUS</div>' +
      '<div class="nxc-poster__model">' + v.name + '</div>' +
      '<div class="nxc-poster__colorline">' +
        '<span class="nxc-poster__swatch" style="background:' + extHex() + '"></span>' +
        '<span class="nxc-poster__cname">' + extName() + '</span>' +
        '<span class="nxc-poster__price">' + v.price + ' 起</span>' +
      '</div>';

    // 規格格（來自上方重點規格）
    const specWrap = el('div', 'nxc-poster__specs');
    specWrap.innerHTML = specs.map(s =>
      '<div class="nxc-poster__spec"><span class="k">' + s.k + '</span><span class="v">' + s.v + '</span></div>'
    ).join('');

    // 分享列
    const share = el('div', 'nxc-poster__share');
    share.innerHTML =
      '<div class="nxc-poster__sharebtns">' +
        '<button class="wf-btn wf-btn--secondary wf-btn--sm" data-sh="copy"><span class="nxc-poster__ic">◍</span>複製連結</button>' +
        '<button class="wf-btn wf-btn--secondary wf-btn--sm" data-sh="save"><span class="nxc-poster__ic">⤓</span>儲存圖片</button>' +
        '<button class="wf-btn wf-btn--secondary wf-btn--sm" data-sh="fb"><span class="nxc-poster__ic">f</span>分享 FB</button>' +
        '<button class="wf-btn wf-btn--secondary wf-btn--sm" data-sh="line"><span class="nxc-poster__ic">L</span>分享 LINE</button>' +
      '</div>';
    const url = location.href;
    share.querySelector('[data-sh="copy"]').addEventListener('click', () => {
      const done = () => showToast('已複製連結');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(done);
      else done();
    });
    share.querySelector('[data-sh="save"]').addEventListener('click', () => showToast('圖片已儲存'));
    share.querySelector('[data-sh="fb"]').addEventListener('click', () =>
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener'));
    share.querySelector('[data-sh="line"]').addEventListener('click', () =>
      window.open('https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url), '_blank', 'noopener'));

    card.appendChild(bar);
    card.appendChild(hero);
    card.appendChild(head);
    card.appendChild(specWrap);
    card.appendChild(share);
    screen.appendChild(card);
  }

  /* ---- 7 · 放大看細節 ------------------------------------- */
  function openZoom() {
    let lb = document.getElementById('nxc-zoom');
    if (!lb) {
      lb = el('div', 'nx-lb'); lb.id = 'nxc-zoom';
      lb.innerHTML = '<div class="nx-lb__bd" data-close></div>' +
        '<div class="nx-lb__box"><button class="nx-lb__x" data-close>✕</button>' +
        '<div class="wf-img" style="width:100%;height:100%"><span class="wf-img__label" data-zlabel></span></div></div>';
      document.body.appendChild(lb);
      lb.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) lb.classList.remove('is-open'); });
    }
    const ang = angleInfo(state.view, curFrame(state.view));
    lb.querySelector('[data-zlabel]').textContent =
      'PINCH ZOOM · ' + ver().name + ' · ' + ang.cn + ' · ' + (state.view === 'trim' ? trimObj().name : state.view === 'int' ? intName() : extName());
    lb.classList.add('is-open');
  }

  /* ---- 8 · 對外介面 -------------------------------------- */
  window.NXConfigurator = {
    renderEntry: renderEntry,
    renderFlat: renderFlat,
    open: open,
    openPoster: openPoster,
    close: close,
    setDevice: function (dev) {
      if (overlay) { overlay.dataset.device = dev; setScreenWidth(); }
      if (flatCtx && flatCtx.dev !== dev) { renderFlat(flatCtx.sel); }
    },
    _data: { VERSIONS, EXT_COLORS, WHEELS, INT_COLORS, TRIMS, STEPS },
  };
})();
