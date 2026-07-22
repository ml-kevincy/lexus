/* ============================================================
   LEXUS 官網 · 主選單 menu.js（首頁／車款頁共用）
   桌機 mega menu（下拉大面板）＋ 手機 drawer（全屏抽屜）
   車款 panel 兩維度篩選：分類（車種）× 動力，皆可多選
   ============================================================ */
(function () {
  var MODELS = [
    { name: 'ES', body: 'sedan', powers: ['hybrid'], badge: 'NEW', price: 'NT$177~250萬', grade: '500e / 300h', href: 'es.html' },
    { name: 'IS', body: 'sedan', powers: ['gas', 'hybrid'], price: 'NT$189~214萬', grade: '300h' },
    { name: 'LS', body: 'sedan', powers: ['gas', 'hybrid'], price: 'NT$515~590萬', grade: '500h' },
    { name: 'RX', body: 'suv', powers: ['gas', 'hybrid'], price: 'NT$246~361萬', grade: '500h / 450h / 350h / 350' },
    { name: 'NX', body: 'suv', powers: ['gas', 'hybrid'], price: 'NT$171~284.5萬', grade: '450h+ / 350h / 350 / 200' },
    { name: 'UX', body: 'suv', powers: ['hybrid'], price: 'NT$149.9~171.9萬', grade: '300h' },
    { name: 'LBX', body: 'suv', powers: ['hybrid'], price: 'NT$127.9~169萬', grade: 'Relax + / Relax / Cool / Active + / Active' },
    { name: 'LM', body: 'suv', powers: ['hybrid'], price: 'NT$429~596萬', grade: '500h / 350h' },
    { name: 'RZ', body: 'suv', powers: ['bev'], price: 'NT$215~255萬', grade: '550e / 500e' },
    { name: 'Lexus Electrified Sport Concept', body: 'concept', powers: ['bev'], concept: true },
    { name: 'LF-ZC', body: 'concept', powers: ['bev'], concept: true }
  ];
  // 兩維度篩選設定（多選）
  var FILTERS = [
    { key: 'body', label: '分類', options: [
      { v: 'sedan', label: 'SEDAN', zh: '轎車' },
      { v: 'suv', label: 'SUV/MPV', zh: '休旅車' },
      { v: 'concept', label: '概念車', zh: 'CONCEPT' }
    ] },
    { key: 'power', label: '動力', options: [
      { v: 'gas', label: '汽油' },
      { v: 'hybrid', label: '油電' },
      { v: 'bev', label: '純電' }
    ] }
  ];
  var sel = { body: {}, power: {} };
  function selCount(k) { return Object.keys(sel[k]).length; }

  var LINKS = {
    buy: ['購車優惠', '試乘・諮詢', '據點查詢', '尊榮科技展演'],
    brand: ['品牌介紹', '創新科技', '駕馭樂趣', '榮耀里程碑', 'LEXUS 驚探生活誌', 'LEXUS LINE',
      'LEXUS ELECTRIFIED', 'LEXUS LINK', 'Lexus Plus App', '車主尊享活動', 'HOTAI購', 'LEXUS Careers'],
    service: ['預約回廠', '保證方案 / 延長保證', '服務特色', '保養計劃', '電動車專區', '和泰Points 點數', '零件與服務']
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function modelCard(m, mediaCls) {
    var badge = '';
    if (m.ev) badge = '<span class="mm-badge mm-badge--ev">EV</span>';
    else if (m.badge) badge = '<span class="mm-badge' + (m.concept ? ' mm-badge--concept' : '') + '">' + m.badge + '</span>';
    var href = m.href || '#';
    var info = '';
    if (m.price) info += '<span class="mm-model__price">' + esc(m.price) + '</span>';
    if (m.grade) info += '<span class="mm-model__grade">' + esc(m.grade) + '</span>';
    return '<a class="mm-model" href="' + href + '" data-body="' + m.body + '" data-powers="' + (m.powers || []).join(' ') + '">' +
      '<div class="wf-img ' + mediaCls + ' mm-model__media"><span class="wf-img__label">' + esc(m.name.toUpperCase()) + '</span></div>' +
      '<div class="mm-model__row"><span class="mm-model__name">' + esc(m.name) + '</span>' + badge + '</div>' +
      (info ? '<div class="mm-model__info">' + info + '</div>' : '') + '</a>';
  }
  function modelCardsHTML(mediaCls) { return MODELS.map(function (m) { return modelCard(m, mediaCls); }).join(''); }

  // 桌機左側展開式篩選群組（可多選）
  function filtersHTML() {
    var groups = FILTERS.map(function (f) {
      var opts = f.options.map(function (o) {
        return '<button class="mm-fchip" data-fk="' + f.key + '" data-fv="' + o.v + '" aria-pressed="false">' +
          '<span class="mm-fchip__l">' + o.label + '</span>' +
          (o.zh ? '<span class="mm-fchip__z">' + o.zh + '</span>' : '') + '</button>';
      }).join('');
      return '<div class="mm-fgroup"><div class="mm-fgroup__head">' + f.label + '</div>' +
        '<div class="mm-fgroup__opts">' + opts + '</div></div>';
    }).join('');
    return groups + '<button class="mm-fclear" data-fclear hidden>清除篩選</button>';
  }
  // 手機／平板兩個多選下拉
  function dropdownsHTML() {
    return FILTERS.map(function (f) {
      var opts = f.options.map(function (o) {
        return '<label class="mm-sel__opt"><input type="checkbox" data-fk="' + f.key + '" data-fv="' + o.v + '" />' +
          '<span>' + o.label + (o.zh ? ' · ' + o.zh : '') + '</span></label>';
      }).join('');
      return '<div class="mm-sel" data-sel="' + f.key + '">' +
        '<button class="mm-sel__btn" data-sel-btn><span class="mm-sel__label">' + f.label + '</span><span class="chev">▾</span></button>' +
        '<div class="mm-sel__pop">' + opts + '</div></div>';
    }).join('');
  }

  function otherPowersOK(m) { return !selCount('power') || m.powers.some(function (x) { return sel.power[x]; }); }
  function otherBodyOK(m) { return !selCount('body') || sel.body[m.body]; }
  function optAvailable(k, v) {
    return MODELS.some(function (m) {
      var self = (k === 'body') ? (m.body === v) : (m.powers.indexOf(v) >= 0);
      if (!self) return false;
      return (k === 'body') ? otherPowersOK(m) : otherBodyOK(m);
    });
  }
  function matchCard(el) {
    var b = el.getAttribute('data-body');
    var p = (el.getAttribute('data-powers') || '').split(' ');
    var okB = !selCount('body') || sel.body[b];
    var okP = !selCount('power') || p.some(function (x) { return sel.power[x]; });
    return okB && okP;
  }

  function applyFilter() {
    // 反映控制項狀態＋兩選單連動：停用會造成空結果的選項
    document.querySelectorAll('.mm-fchip[data-fk]').forEach(function (c) {
      var k = c.getAttribute('data-fk'), v = c.getAttribute('data-fv');
      var on = !!sel[k][v];
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
      c.disabled = !on && !optAvailable(k, v);
    });
    document.querySelectorAll('.mm-sel__opt input[data-fk]').forEach(function (cb) {
      var k = cb.getAttribute('data-fk'), v = cb.getAttribute('data-fv');
      cb.checked = !!sel[k][v];
      cb.disabled = !cb.checked && !optAvailable(k, v);
    });
    // 下拉按鈕標籤附計數
    document.querySelectorAll('.mm-sel[data-sel]').forEach(function (s) {
      var k = s.getAttribute('data-sel'), n = selCount(k);
      var f = FILTERS.filter(function (x) { return x.key === k; })[0];
      var lab = s.querySelector('.mm-sel__label');
      if (lab && f) lab.textContent = f.label + (n ? ' (' + n + ')' : '');
      s.classList.toggle('is-active', n > 0);
    });
    // 卡片顯示／隱藏 ＋ 計數
    var total = 0;
    ['[data-model-grid]', '[data-dgrid]'].forEach(function (q) {
      document.querySelectorAll(q).forEach(function (grid) {
        var shown = 0;
        grid.querySelectorAll('.mm-model').forEach(function (card) {
          var ok = matchCard(card);
          card.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        total = shown;
      });
    });
    document.querySelectorAll('[data-model-count]').forEach(function (c) { c.textContent = '車款 (' + total + ')'; });
    // 清除鍵顯示
    var any = selCount('body') + selCount('power') > 0;
    document.querySelectorAll('[data-fclear]').forEach(function (b) { b.hidden = !any; });
  }

  function toggleSel(k, v) {
    if (sel[k][v]) delete sel[k][v]; else sel[k][v] = true;
    applyFilter();
  }
  function clearSel() { sel = { body: {}, power: {} }; applyFilter(); }

  function linkItem(t) { return '<a class="mm-link" href="#">' + esc(t) + '</a>'; }
  var LINK_COLS = { buy: 4, brand: 6, service: 4 };

  // ---- 填入桌機車款面板 ----
  var grid = document.querySelector('[data-model-grid]');
  var filtersBox = document.querySelector('[data-model-filters]');
  if (grid) grid.innerHTML = modelCardsHTML('wf-img--plain');
  if (filtersBox) filtersBox.innerHTML = filtersHTML();

  Object.keys(LINKS).forEach(function (k) {
    var box = document.querySelector('[data-links="' + k + '"]');
    if (box) { box.innerHTML = LINKS[k].map(linkItem).join(''); box.style.setProperty('--mm-cols', LINK_COLS[k] || 4); }
  });

  // 桌機 hover 下拉
  var wrap = document.querySelector('[data-mm-wrap]');
  var allNav = wrap ? wrap.querySelectorAll('.wf-nav a') : [];
  var panels = wrap ? wrap.querySelectorAll('.mm__panel') : [];
  function showPanel(id) { panels.forEach(function (p) { p.classList.toggle('is-open', p.getAttribute('data-mm-panel') === id); }); }
  function hidePanels() { panels.forEach(function (p) { p.classList.remove('is-open'); }); }
  var modelsHref = (MODELS.filter(function (m) { return m.name === 'ES'; })[0] || {}).href || '#';
  allNav.forEach(function (a) {
    a.addEventListener('mouseenter', function () {
      var id = a.getAttribute('data-mm');
      if (id) showPanel(id); else hidePanels();
    });
    if (a.getAttribute('data-mm') === 'models') { a.setAttribute('href', modelsHref); return; }
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
  document.addEventListener('click', function (e) { if (wrap && !wrap.contains(e.target)) hidePanels(); });

  // ---- 手機 drawer 內容（accordion）----
  var NAV = [
    { key: 'models', label: '車款介紹' },
    { key: 'buy', label: '購車資訊' },
    { key: 'brand', label: '品牌專區' },
    { key: 'service', label: '售後服務' },
    { key: null, label: '認證中古車' },
    { key: null, label: '最新消息' }
  ];
  var body = document.querySelector('[data-drawer-body]');
  if (body) {
    var html = NAV.map(function (item) {
      if (!item.key) return '<div class="mm-acc mm-acc--plain"><button class="mm-acc__head" data-plain>' + item.label + '</button></div>';
      var inner;
      if (item.key === 'models') {
        inner = '<div class="mm-selrow" data-dfilters>' + dropdownsHTML() + '</div>' +
          '<div class="mm-fbar"><span class="mm-count" data-model-count></span><button class="mm-fclear mm-fclear--d" data-fclear hidden>重設顯示全部車款</button></div>' +
          '<div class="mm-dgrid" data-dgrid>' + modelCardsHTML('wf-img--plain') + '</div>';
      } else {
        inner = '<div class="mm-dlinks">' + LINKS[item.key].map(linkItem).join('') + '</div>';
      }
      return '<div class="mm-acc"><button class="mm-acc__head">' + item.label + '<span class="chev">▾</span></button><div class="mm-acc__body">' + inner + '</div></div>';
    }).join('');
    html += '<div class="mm-drawer__film"><button class="wf-btn wf-btn--film wf-btn--block">LEXUS MY FILM ›</button></div>';
    body.innerHTML = html;
    body.querySelectorAll('.mm-acc:not(.mm-acc--plain) .mm-acc__head').forEach(function (h) {
      h.addEventListener('click', function () { h.parentNode.classList.toggle('is-open'); });
    });
    // 手機下拉開關（點按鈕開合，點外部關閉，勾選不關閉以利多選）
    body.querySelectorAll('.mm-sel [data-sel-btn]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var box = btn.closest('.mm-sel'), open = box.classList.contains('is-open');
        body.querySelectorAll('.mm-sel').forEach(function (s) { s.classList.remove('is-open'); });
        box.classList.toggle('is-open', !open);
      });
    });
    body.addEventListener('click', function (e) {
      if (!e.target.closest('.mm-sel')) body.querySelectorAll('.mm-sel').forEach(function (s) { s.classList.remove('is-open'); });
    });
  }

  // ---- 篩選控制項綁定（桌機 chip ＋ 手機 checkbox ＋ 清除）----
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.mm-fchip[data-fk]');
    if (chip) { e.preventDefault(); toggleSel(chip.getAttribute('data-fk'), chip.getAttribute('data-fv')); return; }
    if (e.target.closest('[data-fclear]')) { e.preventDefault(); clearSel(); }
  });
  document.addEventListener('change', function (e) {
    var cb = e.target.closest('.mm-sel__opt input[data-fk]');
    if (cb) toggleSel(cb.getAttribute('data-fk'), cb.getAttribute('data-fv'));
  });
  applyFilter();

  // ---- drawer 開關 ----
  var drawer = document.querySelector('[data-drawer]');
  function setDrawer(open) { if (drawer) drawer.classList.toggle('is-open', open); }
  document.querySelectorAll('[data-drawer-open]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  document.querySelectorAll('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
})();
