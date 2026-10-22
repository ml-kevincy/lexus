/* mirror shim: replay recorded API responses and resolve root-relative URLs.
   window.__MIRROR_ROOT is the relative path from the page to the mirror root. */
(function () {
  var ROOT = window.__MIRROR_ROOT || './';
  var BASE = new URL(ROOT, location.href).pathname;
  var nativeFetch = window.fetch;
  function needsBase(u) { return typeof u === 'string' && /^\/(?!\/)/.test(u) && u.indexOf(BASE) !== 0; }

  function apiKey(u) {
    var a = document.createElement('a');
    a.href = u;
    if (!/(^|\.)lexus\.com\.tw$/.test(a.hostname) && a.host !== location.host) return null;
    var m = a.pathname.match(/\/((api|xml)\/[^?]+\.ashx)$/i);
    if (!m) return null;
    var q = a.search.slice(1).split('&')
      .filter(function (s) { return s && s[0] !== '_' && !/=\d{6,}$/.test(s); })
      .map(function (s) { return decodeURIComponent(s); })
      .sort().join('&');
    return BASE + '_api/' + m[1] + (q ? '__' + q.replace(/[^\w=&.-]/g, '_') : '') + '.txt';
  }

  // Write endpoints never reach the live site; they get a canned success built from the form.
  var FAKE = {
    testdrive_submit: function (body) {
      var p = {};
      new URLSearchParams(body || '').forEach(function (v, k) { p[k] = v; });
      var json = function (f) { return nativeFetch(BASE + '_api/api/' + f).then(function (r) { return r.json(); }); };
      return Promise.all([json('location.ashx.txt'), json('testdrive_car.ashx.txt')]).then(function (res) {
        var picked = document.querySelector('.location_info.checked');
        var key = (picked && picked.getAttribute('data-key')) || p.LOC;
        var s = (res[0].DATA || []).filter(function (x) { return x.KEY === key; })[0] || {};
        var car = { textContent: '' };
        (res[1].DATA || []).forEach(function (g) { (g.cars || []).forEach(function (c) { if (c.id === p.CAR) car.textContent = c.name; }); });
        var time = document.querySelector('.chosed_date option:checked');
        return {
          RS: 'OK',
          DATA: { EVENT_LINK: 'javascript:;', EVENT_ICS: 'javascript:;' },
          DATA2: {
            NAME: p.NAME, CARNAME: (car && car.textContent.trim()) || '', DEMAND_TYPE: p.DEMAND_TYPE,
            DATE: p.DATE, TIME: time ? time.textContent.trim() : '', COMPANY: s.BRANCHFULLNM || '',
            ADDRESS: s.ADDR || '', TEL: s.TEL || '', LAT: s.LATITUDE || 25.04, LNG: s.LONGITUDE || 121.53,
          },
        };
      });
    },
    testdrive_cancel: function () { return Promise.resolve({ RS: 'OK' }); },
  };
  function fakeName(u) {
    var m = /\/api\/(\w+)\.ashx/i.exec(u || '');
    return m && FAKE[m[1]] ? m[1] : null;
  }

  var open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, u) {
    this.__fake = fakeName(u);
    if (this.__fake) return open.call(this, 'GET', 'data:application/json,{}');
    var k = apiKey(u);
    if (k) { arguments[0] = 'GET'; arguments[1] = k; }
    else if (needsBase(u)) arguments[1] = BASE + u.slice(1);
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (!this.__fake) return send.apply(this, arguments);
    var xhr = this;
    FAKE[this.__fake](body).then(function (res) {
      open.call(xhr, 'GET', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res)));
      send.call(xhr);
    });
  };

  // Tracking calls left in site scripts become no-ops.
  window.dataLayer = window.dataLayer || [];
  ['fbq', 'ga', 'gtag', '_lt'].forEach(function (n) { if (!window[n]) window[n] = function () {}; });
  if (nativeFetch) {
    window.fetch = function (u, opts) {
      if (typeof u === 'string') {
        var k = apiKey(u);
        if (k) return nativeFetch.call(this, k);
        if (needsBase(u)) u = BASE + u.slice(1);
      }
      return nativeFetch.call(this, u, opts);
    };
  }

  // Root-relative URLs inserted by scripts (Vue templates, sliders) point at the server root.
  var ROOTREL = /^\/(?!\/)/;
  var PAGES = window.__MIRROR_PAGES || {};
  function fix(el) {
    if (!el.getAttribute) return;
    // Links: mirrored pages stay local, everything else goes to the live site.
    if (el.tagName === 'A') {
      var h = el.getAttribute('href');
      if (h && ROOTREL.test(h) && h.indexOf(BASE) !== 0) {
        var p = h.split(/[?#]/)[0].toLowerCase().replace(/\/$/, '') || '/';
        el.setAttribute('href', PAGES[p] ? BASE + PAGES[p] + (h.match(/#.*/) || [''])[0] : 'https://www.lexus.com.tw' + h);
      }
    }
    var src = el.getAttribute('src');
    if (src && /\.ashx/i.test(src) && src.indexOf('/_api/') < 0) { var ak = apiKey(src); if (ak) el.setAttribute('src', ak); }
    ['src', 'href', 'poster', 'data-src'].forEach(function (n) {
      var v = el.getAttribute(n);
      if (v && ROOTREL.test(v) && v.indexOf(BASE) !== 0) el.setAttribute(n, BASE + v.slice(1));
    });
    var ss = el.getAttribute('srcset');
    if (ss && /(^|,\s*)\/(?!\/)/.test(ss)) el.setAttribute('srcset', ss.replace(/(^|,\s*)\/(?!\/)/g, '$1' + BASE));
    var st = el.getAttribute('style');
    if (st && /url\((['"]?)\/(?!\/)/.test(st) && st.indexOf(BASE) < 0) el.setAttribute('style', st.replace(/url\((['"]?)\/(?!\/)/g, 'url($1' + BASE));
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === 'attributes') return fix(m.target);
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        fix(n);
        n.querySelectorAll('[src],[href],[srcset],[style],[poster],[data-src]').forEach(fix);
      });
    });
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['src', 'href', 'srcset', 'style', 'poster', 'data-src'],
  });
})();

/* load 事件在鏡像站太早結束（API 讀的是本機快照），頁面程式晚綁定 load 就永遠等不到，
   首圖等進場動畫會一直停在透明狀態。晚綁的 load 監聽補觸發一次。 */
(function () {
  var add = window.addEventListener;
  window.addEventListener = function (type, fn) {
    if (type === 'load' && typeof fn === 'function' && document.readyState === 'complete') {
      setTimeout(function () { fn.call(window, new Event('load')); }, 0);
    }
    return add.apply(this, arguments);
  };
})();
