/* GA 事件標示：把官網頁面放進 iframe，由人在頁面上直接畫出標記並選擇事件；
   前端點標記即可看到事件內容、複製程式碼。標記只畫在 iframe 內的覆蓋層，不改動頁面本身。
   標記資料：annotations.json（已發佈）＋ 瀏覽器內的草稿（localStorage）。事件內容見 events.js。 */
(function () {
  var D = window.GA_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var VL = { mirror: '舊版', redesign: '新版' };
  var FW = { desktop: 1440, mobile: 390 };        // 固定的版面寬度，讓標記位置在不同螢幕上一致
  var COLOR = { 1: '#d6001c' };
  var KEY = 'ga-markers-draft';

  var st = { v: 'mirror', p: 'home', d: 'desktop', edit: false, marks: true, tab: 'marks', sel: null, armed: null, markers: [], published: [], other: false };
  var frame = $('#frame'), wrap = $('#wrap'), stage = $('#stage'), ext = $('#ext'), hint = $('#hint');
  var live = null;

  /* ---------- helpers ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('is-show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('is-show'); }, 2000); }
  function copy(text, msg) {
    var ok = function () { toast(msg || '已複製'); };
    var fb = function () { var a = document.createElement('textarea'); a.value = text; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) { prompt('請手動複製', text); } a.remove(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fb); else fb();
  }
  function strip(m) { var c = {}; Object.keys(m).forEach(function (k) { if (k !== 'no') c[k] = m[k]; }); return c; }
  function save() { store(KEY, JSON.stringify(st.markers.map(strip))); $('#draft').hidden = false; }
  function mid() { return D.measurementId; }
  function baseCode() {
    var id = mid();
    return '<!-- Google tag (gtag.js)：研究用 GA4 資源 -->\n' +
      '<script async src="https://www.googletagmanager.com/gtag/js?id=' + id + '"><\/script>\n' +
      '<script>\n' +
      '  window.dataLayer = window.dataLayer || [];\n' +
      '  function gtag(){dataLayer.push(arguments);}\n' +
      '  gtag(\'js\', new Date());\n' +
      '  gtag(\'config\', \'' + id + '\');\n' +
      '<\/script>';
  }
  function renderBase() { $('#baseCode').textContent = baseCode(); }
  function evOf(m) { return D.evt[m.ev] || { params: [], trigger: '', purpose: '（事件庫中找不到這個事件）' }; }
  function byId(id) { return st.markers.filter(function (m) { return m.id === id; })[0]; }
  function cur() {
    var l = st.markers.filter(function (m) { return m.v === st.v && m.p === st.p && m.d === st.d; });
    l.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    l.forEach(function (m, i) { m.no = i + 1; });
    return l;
  }

  /* ---------- 參數與程式碼 ---------- */
  function paramList(m) {
    return evOf(m).params;
  }
  function val(m, k) { return (m.par && m.par[k]) || ''; }
  function incomplete(m) { return paramList(m).some(function (k) { var h = D.help[k] || {}; return h.any && !h.dyn && val(m, k) === ''; }); }
  function codeRows(m) {
    var rows = [['send_to', "'" + mid() + "'", '研究用 GA4 資源的評估 ID']];
    paramList(m).forEach(function (k) {
      var h = D.help[k] || {}, v = val(m, k), lit, c = '';
      if (v === '@skip') return;
      if (v === '@dyn' || (v === '' && h.dyn)) { lit = "'{{" + k + "}}'"; c = (h.dyn || '') + (h.num ? '（數字）' : ''); }
      else if (v === '') { lit = "''"; c = '請選擇：' + (h.any || []).join(' / '); }
      else lit = h.num && !isNaN(v) ? v : "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
      rows.push([k, lit, c]);
    });
    return rows;
  }
  function codeFor(m) {
    var rows = codeRows(m), out = ["gtag('event', '" + m.ev + "', {"];
    rows.forEach(function (r, i) { out.push('  ' + r[0] + ': ' + r[1] + (i < rows.length - 1 ? ',' : '') + (r[2] ? '  // ' + r[2] : '')); });
    out.push('});');
    return out.join('\n');
  }
  function attrFor(m) { return 'data-track="' + m.ev + '"'; }

  /* ---------- 頂端列 ---------- */
  function renderBar() {
    var pb = $('[data-g="p"]');
    if (!pb.children.length) Object.keys(D.pages).forEach(function (k) { var b = document.createElement('button'); b.dataset.v = k; b.textContent = D.pages[k].label; pb.appendChild(b); });
    document.querySelectorAll('[data-g="p"] button').forEach(function (b) { b.hidden = !D.pages[b.dataset.v].url[st.v]; });
    [['v', st.v], ['p', st.p], ['d', st.d]].forEach(function (x) {
      document.querySelectorAll('[data-g="' + x[0] + '"] button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === x[1]); });
    });
  }
  function writeHash() { history.replaceState(null, '', '#v=' + st.v + '&p=' + st.p + (st.d === 'mobile' ? '&d=mobile' : '')); }
  function layout() {
    var w0 = stage.clientWidth - 28, h0 = stage.clientHeight - 28;
    if (w0 < 50 || h0 < 50) return;
    var fw = FW[st.d], k = Math.min(1, w0 / fw);
    wrap.style.width = Math.round(fw * k) + 'px'; wrap.style.height = h0 + 'px';
    frame.style.width = fw + 'px'; frame.style.height = Math.round(h0 / k) + 'px'; frame.style.transform = 'scale(' + k + ')';
  }
  function go() {
    if (!D.pages[st.p].url[st.v]) st.p = 'home';
    st.sel = null; disarm(); renderBar(); writeHash(); layout();
    ext.hidden = true; st.other = false;
    frame.src = D.pages[st.p].url[st.v];
    renderPanel();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.seg button'); if (!b) return;
    var g = b.parentNode.dataset.g;
    if (g === 'd') { st.d = b.dataset.v; if (st.p === 'menu') { go(); return; } st.sel = null; disarm(); renderBar(); writeHash(); layout(); setTimeout(function () { draw(); renderPanel(); }, 300); return; }
    st[g] = b.dataset.v; go();
  });
  $('#marks').addEventListener('change', function () { st.marks = this.checked; draw(); });
  $('#edit').addEventListener('change', function () { st.edit = this.checked; if (!st.edit) disarm(); draw(); renderPanel(); });
  $('#mid').value = D.measurementId; $('#mid').readOnly = true;
  $('#baseCopy').addEventListener('click', function () { copy(baseCode(), '已複製基礎追蹤碼'); });
  renderBase();
  $('#rulesList').innerHTML = D.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');
  $('#rulesBtn').addEventListener('click', function () { $('#rulesModal').hidden = false; });
  $('#rulesClose').addEventListener('click', function () { $('#rulesModal').hidden = true; });
  $('#rulesModal').addEventListener('click', function (e) { if (e.target.id === 'rulesModal') this.hidden = true; });
  $('#back').addEventListener('click', go);
  $('#cancelArm').addEventListener('click', function () { disarm(); renderPanel(); });

  $('#exportBtn').addEventListener('click', function () {
    var json = JSON.stringify(st.markers.map(strip), null, 1);
    copy(json, '已複製標示資料（' + st.markers.length + ' 個標記），同時下載 annotations.json');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = 'annotations.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $('#discard').addEventListener('click', function () {
    ask('放棄瀏覽器裡的草稿，改用已發佈的標示嗎？', function () {
      store(KEY, null); st.markers = st.published.slice(); st.sel = null; $('#draft').hidden = true; draw(); renderPanel();
    });
  });

  /* ---------- 側欄 ---------- */
  function setView(n) { ['marks', 'lib', 'detail'].forEach(function (k) { $('#' + k + 'View').hidden = k !== n; }); }
  function renderPanel() {
    var n = st.other ? 0 : cur().length;
    document.querySelectorAll('#tabs button').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.t === st.tab && !st.sel);
      if (b.dataset.t === 'marks') b.textContent = '本頁標記（' + n + '）';
    });
    if (st.sel && byId(st.sel)) { setView('detail'); renderDetail(); return; }
    st.sel = null; setView(st.tab);
    if (st.tab === 'lib') renderLib(); else renderMarks();
  }
  $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.tab = b.dataset.t; st.sel = null; renderPanel(); draw(); } });

  var TRASH = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12M8.5 9v5M11.5 9v5"/></svg>';
  function removeMarker(id) {
    var m = byId(id); if (!m) return;
    ask('刪除標記 ' + (m.no || '') + '：' + m.ev + (m.label ? '（' + m.label + '）' : '') + '？', function () {
      st.markers = st.markers.filter(function (x) { return x.id !== id; });
      if (st.sel === id) st.sel = null;
      save(); draw(); renderPanel();
    });
  }
  // 頁面內的確認視窗（內建 confirm 在部分預覽視窗會被擋掉）
  function ask(msg, yes) {
    var box = document.createElement('div');
    box.className = 'modal';
    box.innerHTML = '<div class="modal__box" style="max-width:380px"><p style="margin:0 0 16px"></p><div class="copy" style="justify-content:flex-end"><button data-k="no">取消</button><button class="solid" data-k="yes">確定</button></div></div>';
    box.querySelector('p').textContent = msg;
    function close() { document.removeEventListener('keydown', onKey, true); box.remove(); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); yes(); } }
    box.addEventListener('click', function (e) {
      var k = e.target.dataset && e.target.dataset.k;
      if (k === 'yes') { close(); yes(); } else if (k === 'no' || e.target === box) close();
    });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(box);
    box.querySelector('[data-k="yes"]').focus();
  }
  function renderMarks() {
    var l = st.other ? [] : cur();
    $('#list').innerHTML = l.length ? l.map(function (m) {
      var e = evOf(m);
      return '<li class="row" tabindex="0" data-id="' + m.id + '"><span class="no p1">' + m.no + '</span><div><div class="row__ev">' + esc(m.ev) + '</div>' +
        '<div class="row__name">' + esc(m.label || '（未填元件說明）') + '</div></div>' + (incomplete(m) ? '<span class="st warn">參數未完成</span>' : '<span></span>') +
        (st.edit ? '<button class="del" data-del="' + m.id + '" title="刪除這個標記" aria-label="刪除標記 ' + m.no + '">' + TRASH + '</button>' : '') + '</li>';
    }).join('') : '<li class="empty">' + (st.other ? '這一頁不在標註範圍內。' : st.edit ? '這一頁還沒有標記。<br>切到「事件庫」，挑一個事件按「放置標記」，再到頁面上拖曳畫出範圍。' : '這一頁還沒有標記。<br>要新增標記，請先開啟上方的「編輯模式」。') + '</li>';
  }
  $('#list').addEventListener('click', function (e) {
    var d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); removeMarker(d.dataset.del); return; }
    var r = e.target.closest('.row'); if (r) select(r.dataset.id, true);
  });
  $('#list').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var r = e.target.closest('.row'); if (r) select(r.dataset.id, true); } });

  function renderLib() {
    $('#lib').innerHTML = Object.keys(D.evt).map(function (k) {
      var e = D.evt[k];
      return '<li class="card"><div class="card__h"><code>' + k + '</code>' +
        (e.only ? '<span class="tag">僅舊版</span>' : '') + '</div><p>' + esc(e.brief || e.purpose) + '</p><p class="meta">觸發：' + esc(e.trigger) + '</p><p class="meta">參數：' + e.params.join('、') + '</p>' +
        '<div class="acts"><button class="alt" data-view="' + k + '">檢視內容</button>' +
        '<button data-arm="' + k + '"' + (st.edit ? '' : ' disabled title="請先開啟上方的「編輯模式」"') + '>' + (st.edit ? '放置標記' : '開啟編輯模式後可放置') + '</button></div></li>';
    }).join('');
  }
  $('#lib').addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]'); if (v) { showEvent(v.dataset.view); return; }
    var b = e.target.closest('[data-arm]'); if (b && !b.disabled) arm(b.dataset.arm);
  });

  /* 事件庫：檢視事件內容的視窗（不用開啟編輯模式） */
  function templateCode(k) {
    var e = D.evt[k], rows = [['send_to', "'" + mid() + "'"]];
    e.params.forEach(function (n) { rows.push([n, "'{{" + n + "}}'"]); });
    var out = ["gtag('event', '" + k + "', {"];
    rows.forEach(function (r, i) { out.push('  ' + r[0] + ': ' + r[1] + (i < rows.length - 1 ? ',' : '')); });
    out.push('});');
    return out.join('\n');
  }
  function showEvent(k) {
    var e = D.evt[k]; if (!e) return;
    var rows = e.params.map(function (n) {
      var h = D.help[n] || {}, parts = [];
      if (h.any) parts.push('固定值：' + h.any.join('、'));
      if (h.dyn) parts.push('可由程式動態帶入：' + esc(h.dyn));
      if (h.note) h.note.split('\n').forEach(function (l) { parts.push(esc(l)); });
      if (h.opt) parts.push('可以不帶此參數');
      if (!parts.length) parts.push('—');
      return '<tr><td><code>' + n + '</code></td><td>' + parts.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</td></tr>';
    }).join('');
    $('#evBody').innerHTML =
      '<div class="d__h"><span style="color:var(--muted)">事件名稱</span><code style="font:700 17px ui-monospace,Menlo,monospace">' + k + '</code>' + (e.only ? '<span class="tag">僅舊版</span>' : '') + '</div>' +
      '<dl><dt>目的</dt><dd>' + esc(e.purpose) + '</dd><dt>觸發</dt><dd>' + esc(e.trigger) + '</dd></dl>' +
      '<div><h3>參數</h3><table class="params"><tr><th>名稱</th><th>內容</th></tr><tr><td><code>send_to</code></td><td>所有事件必填：研究用 GA4 資源的評估 ID</td></tr>' + rows + '</table></div>' +
      '<div><h3>程式碼範本</h3><pre class="code" id="evCode">' + esc(templateCode(k)) + '</pre><div class="copy"><button class="solid" id="evCopy">複製範本</button></div>' +
      '<div class="hintline">標記到頁面後，程式碼會依你選的參數值產生；{{ }} 表示由程式動態帶入。</div></div>';
    $('#evCopy').onclick = function () { copy($('#evCode').textContent, '已複製範本'); };
    $('#evModal').hidden = false;
  }
  $('#evClose').addEventListener('click', function () { $('#evModal').hidden = true; });
  $('#evModal').addEventListener('click', function (e) { if (e.target.id === 'evModal') this.hidden = true; });

  function ctl(m, k, ed) {
    var h = D.help[k] || {}, v = val(m, k), any = h.any ? '<div class="hintline">可用值：' + h.any.join('、') + '</div>' : '';
    if (!ed) {
      var shown = v === '@skip' ? '不帶此參數' : v === '@dyn' || (v === '' && h.dyn) ? '<span class="dyn">程式動態帶入</span><div class="hintline">' + esc(h.dyn || '') + '</div>' : v === '' ? '<span class="dyn">尚未選擇</span>' : '<code>' + esc(v) + '</code>';
      return shown + (v && v !== '@dyn' && v !== '@skip' ? '' : any);
    }
    if (h.any) {
      var o = '';
      if (!h.dyn) o += '<option value=""' + (v === '' ? ' selected' : '') + '>請選擇</option>';
      if (h.dyn) o += '<option value="@dyn"' + (v === '' || v === '@dyn' ? ' selected' : '') + '>（程式動態帶入）</option>';
      if (h.opt) o += '<option value="@skip"' + (v === '@skip' ? ' selected' : '') + '>（不帶此參數）</option>';
      h.any.forEach(function (a) { o += '<option' + (a === v ? ' selected' : '') + '>' + a + '</option>'; });
      return '<select data-k="' + k + '">' + o + '</select>' + (h.dyn ? '<div class="hintline">' + esc(h.dyn) + '</div>' : '');
    }
    return '<input type="text" data-k="' + k + '" value="' + esc(v === '@dyn' ? '' : v) + '" placeholder="留空＝程式動態帶入"><div class="hintline">' + esc(h.dyn || '') + '</div>';
  }
  function renderDetail() {
    var m = byId(st.sel); if (!m) { st.sel = null; return renderPanel(); }
    var e = evOf(m), ed = st.edit, dv = $('#detailView');
    dv.className = 'view d';
    dv.innerHTML =
      '<div class="d__bar"><button id="dBack">← 回清單</button><span class="sp"></span><button id="dLocate">在畫面上找到</button>' + (ed ? '<button class="danger" id="dDel">刪除標記</button>' : '') + '</div>' +
      '<div class="d__body">' +
      '<div class="d__h"><span class="no p1">' + m.no + '</span><code>' + esc(m.ev) + '</code></div>' +
      '<div><span class="tag">' + VL[m.v] + '・' + D.pages[m.p].label + '・' + (m.d === 'mobile' ? '手機' : '桌機') + (m.fixed ? '・固定在畫面' : '') + '</span></div>' +
      '<dl><dt>元件</dt><dd>' + (ed ? '<input type="text" data-label value="' + esc(m.label || '') + '" placeholder="例如：KV 主視覺的「深入探索」按鈕">' : esc(m.label || '（未填）')) + '</dd>' +
      '<dt>觸發</dt><dd>' + esc(e.trigger) + '</dd><dt>目的</dt><dd>' + esc(e.purpose) + '</dd></dl>' +
      '<div class="note" id="incNote"' + (incomplete(m) ? '' : ' hidden') + '>還有參數沒選，程式碼裡會留下「請選擇」的提示。</div>' +
      '<div><h3>參數</h3><table class="params"><tr><th>名稱</th><th>值</th></tr>' +
      '<tr><td><code>send_to</code></td><td><code>' + esc(mid()) + '</code><div class="hintline">所有事件必填，指定研究用 GA4 資源的評估 ID</div></td></tr>' +
      paramList(m).map(function (k) { return '<tr><td><code>' + k + '</code></td><td>' + ctl(m, k, ed) + '</td></tr>'; }).join('') +
      '</table></div>' +
      '<div><h3>① 元件加上標記屬性</h3><pre class="code">' + esc(attrFor(m)) + '</pre><div class="copy"><button id="cAttr">複製屬性</button></div></div>' +
      '<div><h3>② 事件程式碼（gtag）</h3><pre class="code" id="codeBox">' + esc(codeFor(m)) + '</pre><div class="copy"><button class="solid" id="cCode">複製程式碼</button><button id="cBoth">複製屬性＋程式碼</button></div></div>' +
      '</div>';
    $('#dBack').onclick = function () { st.sel = null; draw(); renderPanel(); };
    $('#dLocate').onclick = function () { locate(m); };
    $('#cAttr').onclick = function () { copy(attrFor(m), '已複製屬性'); };
    $('#cCode').onclick = function () { copy(codeFor(m), '已複製程式碼'); };
    $('#cBoth').onclick = function () { copy('<!-- ' + (m.label || m.ev) + ' -->\n' + attrFor(m) + '\n\n' + codeFor(m), '已複製'); };
    if (ed) $('#dDel').onclick = function () { removeMarker(m.id); };
  }
  function refreshCode(m) { var c = $('#codeBox'); if (c) c.textContent = codeFor(m); var n = $('#incNote'); if (n) n.hidden = !incomplete(m); }
  $('#detailView').addEventListener('input', function (e) {
    var t = e.target, m = byId(st.sel); if (!m) return;
    if (t.hasAttribute('data-label')) { m.label = t.value; save(); return; }
    if (t.dataset.k) {
      (m.par = m.par || {})[t.dataset.k] = t.value; save();
      refreshCode(m);
    }
  });
  function select(id, doLocate) { st.sel = id; draw(); renderPanel(); if (doLocate) locate(byId(id)); }

  /* ---------- iframe 內的覆蓋層 ---------- */
  var CSS = '#ga-abs,#ga-fix{position:absolute;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none}#ga-fix{position:fixed}' +
    '.ga-box{position:absolute;box-sizing:border-box;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 10%,transparent);pointer-events:none;border-radius:3px;box-shadow:0 0 0 1px rgba(255,255,255,.7)}' +
    '.ga-box.is-sel{border-width:3px;background:color-mix(in srgb,var(--c) 22%,transparent);box-shadow:0 0 0 2px #fff}' +
    '.ga-box.is-flash{animation:gaf .45s 3}@keyframes gaf{50%{background:color-mix(in srgb,var(--c) 50%,transparent)}}' +
    '.ga-badge{position:absolute;min-width:22px;height:22px;padding:0 5px;border-radius:11px;background:var(--c);color:#fff;font:700 12px/22px -apple-system,sans-serif;text-align:center;pointer-events:auto;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.45);border:2px solid #fff;box-sizing:content-box}' +
    '.ga-badge.is-sel{transform:scale(1.25)}' +
    '.is-edit .ga-box{pointer-events:auto;cursor:move}.ga-handle{display:none;position:absolute;right:-7px;bottom:-7px;width:12px;height:12px;background:var(--c);border:2px solid #fff;border-radius:2px;cursor:nwse-resize}.is-edit .ga-handle{display:block}' +
    '#ga-abs.is-off,#ga-fix.is-off{display:none}';

  function setup() {
    teardown();
    var win, doc;
    try { win = frame.contentWindow; doc = win.document; void doc.body; } catch (e) { ext.hidden = false; st.other = true; renderPanel(); return; }
    if (!doc.body || /^about:/.test(win.location.href)) return;
    ext.hidden = true;
    // 在 iframe 內點連結換頁時，跟著更新版本與頁面
    var path = win.location.pathname.toLowerCase();
    var v = path.indexOf('/redesign/') > -1 ? 'redesign' : path.indexOf('/mirror/') > -1 ? 'mirror' : null;
    var p = /[?&]ga=menu\b/.test(win.location.search) ? 'menu' : /testdrive/.test(path) ? (/[?&]id=/.test(win.location.search) ? 'testdrive' : 'testdrive_select') : /showroom\/es\.html$/.test(path) ? 'es' : /\/(redesign|mirror)\/(index\.html)?$/.test(path) ? 'home' : 'other';
    st.other = p === 'other';
    if (v && (v !== st.v || (p !== 'other' && p !== st.p))) { st.v = v; if (p !== 'other') st.p = p; st.sel = null; renderBar(); writeHash(); }
    var s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s);
    var abs = doc.createElement('div'), fix = doc.createElement('div');
    abs.id = 'ga-abs'; fix.id = 'ga-fix';
    doc.documentElement.appendChild(abs); doc.documentElement.appendChild(fix);
    live = { win: win, doc: doc, abs: abs, fix: fix };
    [abs, fix].forEach(function (L) {
      L.addEventListener('click', function (e) { var b = e.target.closest('.ga-badge'); if (b) { e.preventDefault(); e.stopPropagation(); select(b.dataset.id, false); } }, true);
      L.addEventListener('mousedown', onBoxDown, true);
    });
    doc.addEventListener('keydown', onKey, true);
    // 只做了首頁、ES 車款頁、預約試乘頁：其他連結一律不跳轉，避免出現錯誤頁
    var okPaths = Object.keys(D.pages).map(function (k) { return D.pages[k].url[st.v]; }).filter(Boolean)
      .map(function (u) { return normPath(new URL(u, location.href).pathname); });
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^javascript:/i.test(h)) return;
      var u; try { u = new URL(a.href); } catch (x) { u = null; }
      if (u && u.origin === location.origin && okPaths.indexOf(normPath(u.pathname)) > -1) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
    if (p === 'menu') openMenu(win);
    draw(); renderPanel();
  }
  // 舊版選單靠滑鼠移入開啟、移到別處就收起；在標示頁裡開啟後維持展開，點選單以外才收起（載入時不預設展開）
  function normPath(p) { return p.toLowerCase().replace(/index\.html$/, '').replace(/\/$/, ''); }
  function openMenu(win) {
    var $j = win.jQuery; if (!$j) return;
    $j('html').off('mouseover');
    // 展開後不能用漢堡鈕（X）收起，只能點選單以外的範圍
    win.document.addEventListener('click', function (e) {
      if (e.target.closest('.menu__toggler') && $j('body').hasClass('menu-opened-general')) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    // 只有點選單以外的地方才收起選單（編輯、放置標記時不收）
    win.document.addEventListener('click', function (e) {
      if (st.edit || st.armed || e.target.closest('#Menu, #ga-abs, #ga-fix')) return;
      if ($j('body').hasClass('menu-opened-general')) $j('.menu__toggler button').trigger('click');
      $j('.submenu').removeClass('on show'); $j('.submenu .submenu__group').hide(); $j('.menu__navigation li').removeClass('current');
    }, true);
  }
  function teardown() { live = null; }
  frame.addEventListener('load', setup);

  function draw() {
    if (!live) return;
    var l = st.other ? [] : cur(), A = '', F = '';
    l.forEach(function (m) {
      var c = COLOR[1], sel = m.id === st.sel ? ' is-sel' : '';
      var h = '<div class="ga-box' + sel + '" data-id="' + m.id + '" style="--c:' + c + ';left:' + m.x + 'px;top:' + m.y + 'px;width:' + m.w + 'px;height:' + m.h + 'px"><i class="ga-handle"></i></div>' +
        '<div class="ga-badge' + sel + '" data-id="' + m.id + '" title="' + esc(m.ev) + '" style="--c:' + c + ';left:' + (m.x - 8) + 'px;top:' + (m.y - 8) + 'px">' + m.no + '</div>';
      if (m.fixed) F += h; else A += h;
    });
    live.abs.innerHTML = A; live.fix.innerHTML = F;
    [live.abs, live.fix].forEach(function (L) { L.classList.toggle('is-off', !st.marks); L.classList.toggle('is-edit', st.edit && !st.armed); });
  }
  function place(m) {
    [live.abs, live.fix].forEach(function (L) {
      L.querySelectorAll('[data-id="' + m.id + '"]').forEach(function (n) {
        if (n.classList.contains('ga-box')) { n.style.left = m.x + 'px'; n.style.top = m.y + 'px'; n.style.width = m.w + 'px'; n.style.height = m.h + 'px'; }
        else { n.style.left = (m.x - 8) + 'px'; n.style.top = (m.y - 8) + 'px'; }
      });
    });
  }
  function onBoxDown(e) {
    if (!live || !st.edit || st.armed) return;
    var box = e.target.closest('.ga-box'); if (!box) return;
    var m = byId(box.dataset.id); if (!m) return;
    e.preventDefault(); e.stopPropagation();
    var resize = !!e.target.closest('.ga-handle'), sx = e.clientX, sy = e.clientY, ox = m.x, oy = m.y, ow = m.w, oh = m.h, moved = false, doc = live.doc, win = live.win;
    function mv(ev) {
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (resize) { m.w = Math.max(16, Math.round(ow + dx)); m.h = Math.max(16, Math.round(oh + dy)); }
      else { m.x = Math.max(0, Math.round(ox + dx)); m.y = Math.max(0, Math.round(oy + dy)); }
      place(m);
    }
    function up() {
      doc.removeEventListener('mousemove', mv, true); doc.removeEventListener('mouseup', up, true); win.removeEventListener('blur', up); doc.documentElement.removeEventListener('mouseleave', up);
      if (moved) { save(); draw(); renderPanel(); } else select(m.id, false);
    }
    doc.addEventListener('mousemove', mv, true); doc.addEventListener('mouseup', up, true); win.addEventListener('blur', up); doc.documentElement.addEventListener('mouseleave', up);
  }
  function onKey(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape') { $('#evModal').hidden = true; $('#rulesModal').hidden = true; }
    if (e.key === 'Escape') { if (st.armed) { disarm(); renderPanel(); } else if (st.sel) { st.sel = null; draw(); renderPanel(); } }
    if (e.key === 'Delete' && st.edit && st.sel && tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
      removeMarker(st.sel);
    }
  }
  document.addEventListener('keydown', onKey);

  /* ---------- 放置新標記 ---------- */
  function arm(ev) {
    if (!live || st.other) { toast('請先停在首頁、ES 車款頁或預約試乘頁'); return; }
    var e = D.evt[ev];
    if (e.only && e.only !== st.v) { ask('這個事件規格只用在舊版（診斷用，不做前後對照），確定要放在新版嗎？', function () { startArm(ev); }); return; }
    startArm(ev);
  }
  function startArm(ev) {
    st.armed = ev; st.sel = null;
    $('#hintText').textContent = '在頁面上拖曳畫出「' + ev + '」要標示的範圍（Esc 取消）';
    hint.hidden = false; buildCapture(); draw(); renderPanel();
  }
  function disarm() {
    st.armed = null; hint.hidden = true;
    if (live) { var c = live.doc.getElementById('ga-cap'); if (c) c.remove(); draw(); }
  }
  function buildCapture() {
    var doc = live.doc, root = doc.documentElement, cap = doc.createElement('div');
    cap.id = 'ga-cap';
    cap.style.cssText = 'position:absolute;left:0;top:0;width:' + Math.max(root.scrollWidth, root.clientWidth) + 'px;height:' + Math.max(root.scrollHeight, root.clientHeight) + 'px;cursor:crosshair;z-index:2147482999;background:rgba(214,0,28,.04)';
    root.appendChild(cap);
    var band = null, p0 = null, fixed = false;
    var pt = function (e) { return fixed ? { x: e.clientX, y: e.clientY } : { x: e.pageX, y: e.pageY }; };
    cap.addEventListener('mousedown', function (e) {
      e.preventDefault(); fixed = $('#fixedChk').checked; p0 = pt(e);
      band = doc.createElement('div');
      band.style.cssText = 'position:' + (fixed ? 'fixed' : 'absolute') + ';border:2px dashed #d6001c;background:rgba(214,0,28,.12);pointer-events:none;left:' + p0.x + 'px;top:' + p0.y + 'px;width:0;height:0';
      cap.appendChild(band);
    });
    cap.addEventListener('mousemove', function (e) {
      if (!band) return; var p = pt(e);
      band.style.left = Math.min(p.x, p0.x) + 'px'; band.style.top = Math.min(p.y, p0.y) + 'px';
      band.style.width = Math.abs(p.x - p0.x) + 'px'; band.style.height = Math.abs(p.y - p0.y) + 'px';
    });
    doc.addEventListener('mouseup', function fin(e) {
      if (!band) return; doc.removeEventListener('mouseup', fin, true);
      var p = pt(e), w = Math.abs(p.x - p0.x), h = Math.abs(p.y - p0.y), x = Math.min(p.x, p0.x), y = Math.min(p.y, p0.y);
      if (w < 10 && h < 10) { x = p.x - 60; y = p.y - 18; w = 120; h = 36; }
      var m = {
        id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), v: st.v, p: st.p, d: st.d, ev: st.armed, label: '', par: {},
        x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)), w: Math.round(w), h: Math.round(h), fixed: fixed
      };
      st.markers.push(m); save(); st.sel = m.id; disarm(); draw(); renderPanel();
    }, true);
  }
  function locate(m) {
    if (!live || !m) return;
    if (!m.fixed) live.win.scrollTo({ top: Math.max(0, m.y - 160), behavior: 'smooth' });
    setTimeout(function () { if (live) live.doc.querySelectorAll('.ga-box[data-id="' + m.id + '"]').forEach(function (b) { b.classList.remove('is-flash'); void b.offsetWidth; b.classList.add('is-flash'); }); }, 350);
  }

  /* ---------- 啟動 ---------- */
  var h = new URLSearchParams(location.hash.slice(1));
  if (VL[h.get('v')]) st.v = h.get('v');
  if (D.pages[h.get('p')]) st.p = h.get('p');
  if (h.get('d') === 'mobile') st.d = 'mobile';
  $('#edit').checked = false; $('#marks').checked = true; $('#fixedChk').checked = false;  // 瀏覽器回復表單狀態時，以程式狀態為準
  if (window.ResizeObserver) new ResizeObserver(layout).observe(stage); else window.addEventListener('resize', layout);
  fetch('annotations.json?' + Date.now()).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (pub) {
    st.published = Array.isArray(pub) ? pub : [];
    var d = store(KEY);
    if (d) { try { st.markers = JSON.parse(d); $('#draft').hidden = false; } catch (e) { st.markers = st.published.slice(); } } else st.markers = st.published.slice();
    go();
  });
})();
