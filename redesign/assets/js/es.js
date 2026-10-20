/* ES showroom page: configurator, features, model compare, spec table, FAQ. Data: window.ES_DATA (es-data.js). */
(function () {
  var D = window.ES_DATA, I = window.LX_ICON, LIVE = window.LX.LIVE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.querySelectorAll('.peek__nav, .compare__prev, .compare__next').forEach(function (b) { b.innerHTML = I.arrow; });

  var MODELS = ['ES 500e 旗艦版', 'ES 500e 頂級版', 'ES 300h 頂級版', 'ES 300h 豪華版'];
  var SWATCH = { '煥映白': '#f4f2ec', '尊爵黑': '#1f2022', '金耀棕': '#ac805c' };
  var forModel = function (list, m) { return list.filter(function (p) { return !p.models || p.models.indexOf(m) > -1; }); };
  // PSD order for interior swatches: 金耀棕, 尊爵黑, 煥映白
  var ORDER = ['金耀棕', '尊爵黑', '煥映白'];
  var rank = function (p) { for (var k = 0; k < ORDER.length; k++) if (p.name.indexOf(ORDER[k]) === 0) return k; return 9; };
  D.interior.sort(function (a, b) { return rank(a) - rank(b); });

  // ---------- configurator ----------
  var q = new URLSearchParams(location.search);
  var st = {
    model: MODELS.indexOf(q.get('model')) > -1 ? q.get('model') : MODELS[0],
    ext: 'color', view: 'side', int: 'interior',
    color: Math.min(+q.get('color') || 0, D.exterior.length - 1), rim: 0, interior: +q.get('interior') || 0, trim: 0
  };
  var modelSel = $('.js-model');
  modelSel.innerHTML = MODELS.map(function (m) { return '<option' + (m === st.model ? ' selected' : '') + '>' + m + '</option>'; }).join('');
  // each version ships one rim; picking a version jumps to it, but all three stay selectable (names say which version)
  var rimFor = function (m) { var i = D.rim.findIndex(function (r) { return r.models.indexOf(m) > -1; }); return i < 0 ? 0 : i; };
  st.rim = rimFor(st.model);
  modelSel.addEventListener('change', function () { st.model = modelSel.value; st.rim = rimFor(st.model); st.interior = Math.min(st.interior, forModel(D.interior, st.model).length - 1); st.trim = 0; render(); });

  function swatchBtns(items, sel, kind, color) {
    return items.map(function (it, i) {
      var style = color(it);
      return '<button class="swatch' + (style.indexOf('url(') === 0 ? ' swatch--img' : '') + '" role="radio" aria-checked="' + (i === sel) + '" aria-label="' + esc(it.name) + '" data-i="' + i + '" data-kind="' + kind + '" data-ga-id="es_config_' + kind + '_' + (i + 1) + '" style="background:' + style + '"></button>';
    }).join('');
  }
  function render() {
    var rims = D.rim, ints = forModel(D.interior, st.model), trims = forModel(D.trim, st.model);
    var ext = $('.js-ext-swatches'), extImg = $('.js-ext-img'), name = $('.js-ext-name');
    if (st.ext === 'color') {
      var c = D.exterior[st.color];
      ext.innerHTML = swatchBtns(D.exterior, st.color, 'color', function (x) { return x.code; });
      name.textContent = c.name + (c.note ? '　' + c.note : '');
      extImg.src = st.view === 'rear' && c.spin ? c.spin.replace('{index}', '24') : c.car;
      extImg.alt = 'ES ' + c.name;
    } else {
      var r = rims[st.rim] || rims[0];
      ext.innerHTML = swatchBtns(rims, st.rim, 'rim', function (x) { return 'url(' + x.image + ') center/cover'; });
      name.textContent = r ? r.name : '';
      if (r) { extImg.src = r.image; extImg.alt = r.name; }
    }
    $('.config__views').style.visibility = st.ext === 'color' ? 'visible' : 'hidden';
    var intWrap = $('.js-int-swatches'), list = st.int === 'interior' ? ints : trims, idx = st.int === 'interior' ? st.interior : st.trim;
    var cur = list[idx] || list[0];
    intWrap.innerHTML = swatchBtns(list, idx, st.int, function (x) {
      var k = Object.keys(SWATCH).filter(function (n) { return x.name.indexOf(n) === 0; })[0];
      return k ? SWATCH[k] : 'url(' + x.image + ') center/cover';
    });
    $('.js-int-name').textContent = cur ? cur.name.split(' (')[0].split('(')[0] : '';
    $('.js-int-caption').textContent = cur ? cur.name : '';
    if (cur) { $('.js-int-img').src = cur.image; $('.js-int-img').alt = cur.name; }
  }
  document.addEventListener('click', function (e) {
    var s = e.target.closest('.swatch');
    if (!s) return;
    st[s.getAttribute('data-kind')] = +s.getAttribute('data-i');
    render();
  });
  document.querySelectorAll('.config [role="tablist"]').forEach(function (tl) {
    tl.addEventListener('lx:tab', function (e) { st[tl.getAttribute('data-group')] = e.detail.getAttribute('data-value'); render(); });
  });
  render();

  function shareUrl() {
    var u = new URL(location.href.split('#')[0]);
    u.search = '';
    u.searchParams.set('model', st.model);
    u.searchParams.set('color', st.color);
    u.searchParams.set('interior', st.interior);
    return u.href + '#configurator';
  }
  $('.js-copy').addEventListener('click', function () {
    var url = shareUrl();
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { lxToast('已複製我的 ES 連結'); }, function () { prompt('複製此連結', url); });
  });
  $('.js-poster').addEventListener('click', function () {
    var c = D.exterior[st.color], cur = forModel(D.interior, st.model)[st.interior];
    lxModal('<div class="poster"><div class="poster__mark">ES</div><img src="' + c.car + '" alt="">' +
      '<h3 style="font-family:Nobel,sans-serif;font-weight:400;font-size:28px">' + esc(st.model) + '</h3>' +
      '<dl><div><dt>外觀色系</dt><dd>' + esc(c.name) + '</dd></div><div><dt>內裝色系</dt><dd>' + esc(cur ? cur.name.split(' (')[0] : '') + '</dd></div>' +
      '<div><dt>動力系統</dt><dd>' + (st.model.indexOf('500e') > -1 ? 'BEV 純電動力' : 'HEV 油電複合動力') + '</dd></div><div><dt>安全系統</dt><dd>Lexus Safety System +4.0</dd></div></dl></div>' +
      '<div class="modal__body" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' +
      '<button class="btn btn--sm" onclick="lxToast(\'原型示意：圖片將儲存至裝置\')" data-ga-id="es_card_save">儲存圖片</button>' +
      '<button class="btn btn--sm js-copy-2" data-ga-id="es_card_copy_link">複製連結</button>' +
      '<a class="btn btn--sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl()) + '" data-ga-id="es_card_share_fb">分享 FB</a>' +
      '<a class="btn btn--sm" target="_blank" rel="noopener" href="https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(shareUrl()) + '" data-ga-id="es_card_share_line">分享 LINE</a></div>');
    $('.js-copy-2').addEventListener('click', function () { $('.js-copy').click(); });
  });

  // ---------- features ----------
  // Exterior tab uses the four PSD cards (images cut from the design), the rest come from the current site.
  var PSD_FEATURES = [
    ['Spindle Body', '../assets/img/es-feature-1.jpg', 'Spindle Body  紡錘型立體車身設計'],
    ['車側', '../assets/img/es-feature-2.jpg', '車側立體折線設計'],
    ['雙箭型頭燈', '../assets/img/es-feature-3.jpg', 'L-Signature 雙箭型頭燈'],
    ['尾燈', '../assets/img/es-feature-4.jpg', 'LEXUS 字樣貫穿式 LED 尾燈']
  ];
  var design = D.features.design.items.slice();
  var lead = PSD_FEATURES.map(function (p) {
    var hit = design.filter(function (f) { return f.title.indexOf(p[0]) > -1; })[0];
    if (hit) design.splice(design.indexOf(hit), 1);
    return { title: p[2], desc: hit ? hit.desc : '', note: hit ? hit.note : '', image: p[1], models: hit ? hit.models : MODELS };
  });
  D.features.design.items = lead.concat(design);
  var TABS = [['design', '外觀'], ['interior', '內裝'], ['performance', '性能'], ['safety', '安全'], ['charging', '充電']];
  var fTab = 'design', fShowAll = false;
  $('.js-feature-tabs').innerHTML = TABS.map(function (t, i) { return '<button class="chip" role="tab" aria-selected="' + (i === 0) + '" data-value="' + t[0] + '" data-ga-id="es_feature_tab_' + t[0] + '">' + t[1] + '</button>'; }).join('');
  var fModel = $('.js-feature-model');
  fModel.innerHTML += MODELS.map(function (m) { return '<option>' + m + '</option>'; }).join('');
  function renderFeatures() {
    var items = D.features[fTab].items.filter(function (f) { return !fModel.value || f.models.indexOf(fModel.value) > -1; });
    var shown = fShowAll ? items : items.slice(0, 4);
    $('.js-features').innerHTML = shown.length ? shown.map(function (f, i) {
      return '<article class="feature"><img src="' + f.image + '" alt="" loading="lazy"><div class="feature__body"><h3>' + esc(f.title) + '</h3><p>' + esc(f.desc) + '</p>' +
        '<button class="feature__more" data-i="' + D.features[fTab].items.indexOf(f) + '" data-ga-id="es_feature_detail">more</button></div></article>';
    }).join('') : '<p class="features__empty">此車型沒有符合的配備</p>';
    var more = $('.js-feature-more');
    more.hidden = items.length <= 4;
    more.textContent = fShowAll ? '收合' : '查看更多配備（' + items.length + '）';
  }
  $('.js-feature-tabs').addEventListener('lx:tab', function (e) { fTab = e.detail.getAttribute('data-value'); fShowAll = false; renderFeatures(); });
  fModel.addEventListener('change', renderFeatures);
  $('.js-feature-more').addEventListener('click', function () { fShowAll = !fShowAll; renderFeatures(); });
  $('.js-features').addEventListener('click', function (e) {
    var b = e.target.closest('.feature__more');
    if (!b) return;
    var f = D.features[fTab].items[+b.getAttribute('data-i')];
    lxModal('<img src="' + f.image + '" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover"><div class="modal__body"><h3>' + esc(f.title) + '</h3><p>' + esc(f.desc) + '</p>' +
      (f.note ? '<p style="margin-top:12px;font-size:13px;color:#777">' + esc(f.note) + '</p>' : '') + '</div>');
  });
  renderFeatures();

  // ---------- compare ----------
  var COMPARE = [
    ['ES 500e 旗艦版', 'BEV', ['純電動力', '前後雙馬達四驅', 'Mark Levinson 音響', '64 色氣氛燈'], 'NT$250 萬'],
    ['ES 500e 頂級版', 'BEV', ['純電動力', '前後雙馬達四驅', 'Lexus Premium Sound 音響', '19 吋鋁圈'], 'NT$205 萬'],
    ['ES 300h 頂級版', 'HEV', ['油電混合動力', '前輪驅動', '高效能低油耗', '抬頭顯示器'], 'NT$197 萬'],
    ['ES 300h 豪華版', 'HEV', ['油電混合動力', '前輪驅動', '高效能低油耗', '18 吋鋁圈'], 'NT$177 萬']
  ];
  var track = $('.js-compare'), ci = 0;
  track.innerHTML = COMPARE.map(function (c, i) {
    return '<article class="vcard"><h3>' + c[0].replace(/ (旗艦|頂級|豪華)版/, '<br><small style="font-size:.5em">$1版</small>') + '</h3><img src="../assets/img/es-compare-car.png" alt="" loading="lazy">' +
      '<dl><dt>動力系統</dt><dd class="big">' + c[1] + '</dd><dt>重點功能</dt><dd><ul>' + c[2].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></dd></dl>' +
      '<div class="vcard__price"><span>建議售價</span><strong>' + c[3] + '</strong></div>' +
      '<a class="btn btn--sm" style="margin-top:20px" href="../testdrive.html?id=36" data-ga-id="es_compare_testdrive_' + (i + 1) + '"><span class="arrow">預約試乘</span></a></article>';
  }).join('');
  function perView() { return window.innerWidth < 768 ? 1 : 3; }
  function goCompare(n) {
    var max = COMPARE.length - perView();
    ci = Math.max(0, Math.min(max, n));
    var card = track.children[0], gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.transform = 'translateX(' + (-(card.offsetWidth + gap) * ci) + 'px)';
    $('.compare__prev').disabled = ci === 0;
    $('.compare__next').disabled = ci === max;
    $('.compare__prev').style.opacity = ci === 0 ? .35 : 1;
    $('.compare__next').style.opacity = ci === max ? .35 : 1;
  }
  $('.compare__prev').addEventListener('click', function () { goCompare(ci - 1); });
  $('.compare__next').addEventListener('click', function () { goCompare(ci + 1); });
  window.addEventListener('resize', function () { goCompare(ci); });
  goCompare(0);

  // ---------- spec table ----------
  var cars = D.specCars, cols = cars.map(function (c) { return String(c.id); });
  var table = $('.js-spec'), filter = { kind: '', cat: '' }, diffOnly = false;
  document.querySelectorAll('.js-spec-cat').forEach(function (sel) {
    var kind = sel.getAttribute('data-kind');
    sel.innerHTML += D.specTable.filter(function (t) { return t.kind === kind; }).map(function (t) { return '<option>' + esc(t.category) + '</option>'; }).join('');
    sel.addEventListener('change', function () {
      document.querySelectorAll('.js-spec-cat').forEach(function (o) { if (o !== sel) o.value = ''; });
      filter = sel.value ? { kind: kind, cat: sel.value } : { kind: '', cat: '' };
      $('.js-spec-all').setAttribute('aria-pressed', !sel.value);
      renderSpec();
    });
  });
  $('.js-spec-all').addEventListener('click', function () {
    document.querySelectorAll('.js-spec-cat').forEach(function (o) { o.value = ''; });
    filter = { kind: '', cat: '' };
    this.setAttribute('aria-pressed', 'true');
    renderSpec();
  });
  $('.js-spec-diff').addEventListener('change', function () { diffOnly = this.checked; renderSpec(); });
  var open = { '外觀配備': true };
  function cell(v) { return esc(v).replace(/\n/g, '<br>'); }
  function renderSpec() {
    var head = '<thead><tr><th>車款</th>' + cols.map(function (id, k) {
      return '<th><select data-col="' + k + '" aria-label="選擇比較車型" data-ga-id="es_spec_column_' + (k + 1) + '">' + cars.map(function (c) { return '<option value="' + c.id + '"' + (String(c.id) === id ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></th>';
    }).join('') + '</tr></thead>';
    var price = D.specTable[0].rows[0];
    var body = '<tbody><tr class="spec-price"><td>建議售價(萬)</td>' + cols.map(function (id) { return '<td>' + cell(price.values[id]) + '</td>'; }).join('') + '</tr></tbody>';
    D.specTable.slice(1).forEach(function (t) {
      if (filter.cat && (t.kind !== filter.kind || t.category !== filter.cat)) return;
      var rows = t.rows.map(function (r) {
        var vals = cols.map(function (id) { return r.values[id]; });
        var same = vals.every(function (v) { return v === vals[0]; });
        if (diffOnly && same) return '';
        return '<tr class="row"><td>' + cell(r.label) + '</td>' + vals.map(function (v) { return '<td>' + cell(v) + '</td>'; }).join('') + '</tr>';
      }).join('');
      if (diffOnly && !rows) return;
      var isOpen = filter.cat ? true : !!open[t.category];
      body += '<tbody class="group' + (isOpen ? ' is-open' : '') + '"><tr class="cat"><th colspan="' + (cols.length + 1) + '"><button data-cat="' + esc(t.category) + '" aria-expanded="' + isOpen + '" data-ga-id="es_spec_toggle">' + esc(t.category) + I.chev + '</button></th></tr>' + rows + '</tbody>';
    });
    table.innerHTML = head + body;
  }
  table.addEventListener('change', function (e) {
    var s = e.target.closest('select[data-col]');
    if (s) { cols[+s.getAttribute('data-col')] = s.value; renderSpec(); }
  });
  table.addEventListener('click', function (e) {
    var b = e.target.closest('.cat button');
    if (!b || filter.cat) return;
    var c = b.getAttribute('data-cat');
    open[c] = !open[c];
    renderSpec();
  });
  renderSpec();

  function dl(list, icon, ga) {
    return list.map(function (m, i) {
      var href = m.link.charAt(0) === '/' ? LIVE + m.link : m.link;
      return '<a href="' + href + '" target="_blank" rel="noopener" data-ga-id="' + ga + '_' + (i + 1) + '">' + esc(m.title) + icon + '</a>';
    }).join('');
  }
  $('.js-manuals').innerHTML = dl(D.manuals.manual || [], I.download, 'es_spec_manual');
  $('.js-bluetooth').innerHTML = dl(D.manuals.bluetooth || [], I.external, 'es_spec_bluetooth');

  // ---------- FAQ ----------
  // 購車 follows the PSD; answers 2–5 only restate what the current site already says (test-drive notice, dealer contact).
  var warranty = (D.specTable.filter(function (t) { return t.category === '保固'; })[0] || { rows: [] }).rows;
  var FAQ = [
    ['buy', '購車', [
      ['ES有哪些車型可選？', '<p>全新 ES 提供油電複合動力 (HEV) 與純電動力 (BEV) 雙動力設定，共四個車型等級：<br>- ES 300h 豪華版(油電複合動力)<br>- ES 300h 頂級版(油電複合動力)<br>- ES 500e 頂級版(純電動力)<br>- ES 500e 旗艦版(純電動力)<br>各車型之詳細規格與配備差異，請參閱 ES 車型比較，或洽全台 LEXUS 經銷商亦可透過試乘諮詢預約賞車，由專人為您詳細介紹。</p>'],
      ['想試駕可以線上預約嗎？', '<p>可以。請至<a class="link-u" href="../testdrive.html?id=36" data-ga-id="es_faq_link_testdrive">預約試乘</a>頁面選擇車款、營業所與期望時段送出，我們將於兩個工作天內盡速與您聯繫。</p>'],
      ['試駕流程是什麼？', '<p>完成線上預約後，營業所專人將與您確認試乘時間。試乘當日請攜帶駕駛執照於試乘前出示，並依 LEXUS 指定之試乘路線駕駛。</p>'],
      ['交車時間需等多久？', '<p>交車時間依車型、等級、車色與選配而有所不同，請洽 LEXUS 各營業所確認。</p>'],
      ['提供哪些購車優惠或分期方案？', '<p>最新購車優惠請參閱<a class="link-u" href="' + LIVE + '/buycar/sp/index.aspx" data-ga-id="es_faq_link_offer">購車優惠</a>，分期方案請洽 LEXUS 各營業所。</p>']
    ]],
    ['power', '充電/動力', [].concat.apply([], D.faq.map(function (c) { return c.list.map(function (x) { return [x.q, x.a]; }); }))],
    ['care', '保養/保固', [
      ['全新 ES 的保固內容為何？', '<ul>' + warranty.map(function (r) { return '<li>' + esc(r.label) + '：' + esc(r.values[String(cars[0].id)]) + '</li>'; }).join('') + '</ul><p style="margin-top:8px">各車型保固細節請參閱規格配備表「保固」分類。</p>'],
      ['如何預約回廠保養？', '<p>可透過<a class="link-u" href="' + LIVE + '/owners.aspx#/booking" data-ga-id="es_faq_link_booking">車主專區</a>線上預約回廠，或洽 LEXUS 各服務廠。</p>']
    ]]
  ];
  $('.js-faq-tabs').innerHTML = FAQ.map(function (f, i) { return '<button class="chip" role="tab" aria-selected="' + (i === 0) + '" data-value="' + i + '" data-ga-id="es_faq_tab_' + f[0] + '">' + f[1] + '</button>'; }).join('');
  function renderFaq(k) {
    $('.js-faq').innerHTML = FAQ[k][2].map(function (x, i) {
      return '<div class="faq__item' + (i === 0 ? ' is-open' : '') + '"><button class="faq__q" aria-expanded="' + (i === 0) + '" data-ga-id="es_faq_q_' + FAQ[k][0] + '_' + (i + 1) + '">' + esc(x[0]) + I.chev + '</button><div class="faq__a"><div><div>' + x[1] + '</div></div></div></div>';
    }).join('');
  }
  $('.js-faq-tabs').addEventListener('lx:tab', function (e) { renderFaq(+e.detail.getAttribute('data-value')); });
  $('.js-faq').addEventListener('click', function (e) {
    var b = e.target.closest('.faq__q');
    if (!b) return;
    var it = b.parentNode;
    it.classList.toggle('is-open');
    b.setAttribute('aria-expanded', it.classList.contains('is-open'));
  });
  renderFaq(0);
})();
