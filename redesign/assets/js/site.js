/* LEXUS redesign prototype — shared chrome (header, menu, quick links, footer) and UI behaviours.
   Pages set <body data-root="./" | "../">. Interactive elements carry data-ga-id for the GA annotation layer. */
(function () {
  var ROOT = document.body.getAttribute('data-root') || './';
  var MIRROR = ROOT + '../mirror/';
  var LIVE = 'https://www.lexus.com.tw';

  var ICON = {
    member: '<svg viewBox="0 0 28 30" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="14" cy="9" r="7"/><path d="M1.5 29c1.5-7 6.4-11 12.5-11s11 4 12.5 11"/></svg>',
    menu: '<svg viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M0 1h30M0 11h30"/></svg>',
    close: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l24 24M27 3L3 27"/></svg>',
    chev: '<svg viewBox="0 0 16 9" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l7 7 7-7"/></svg>',
    arrow: '<svg viewBox="0 0 14 26" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l12 12L1 25"/></svg>',
    download: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 2v11M5 8l5 5 5-5M2 17h16"/></svg>',
    external: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 3h6v6M17 3l-8 8M14 12v5H3V6h5"/></svg>',
    line: '<svg viewBox="0 0 30 30"><rect width="30" height="30" rx="7" fill="currentColor"/><path fill="#fff" d="M15 7C9.5 7 5 10.6 5 15c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 5.9-3.5 8.1-6 1.5-1.6 2.2-3.3 2.2-5C25.3 10.6 20.8 7 15 7z"/></svg>',
    ig: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="26" height="26" rx="8"/><circle cx="15" cy="15" r="6"/><circle cx="22.5" cy="7.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 16 30"><path fill="currentColor" d="M10.4 30V16.3h4.6l.7-5.3h-5.3V7.6c0-1.5.4-2.6 2.6-2.6H16V.2C15.5.1 13.9 0 12 0 8 0 5.3 2.4 5.3 6.9V11H.7v5.3h4.6V30z"/></svg>',
    yt: '<svg viewBox="0 0 30 21"><path fill="currentColor" d="M29.4 3.3A3.8 3.8 0 0 0 26.7.6C24.4 0 15 0 15 0S5.6 0 3.3.6A3.8 3.8 0 0 0 .6 3.3C0 5.6 0 10.5 0 10.5s0 4.9.6 7.2a3.8 3.8 0 0 0 2.7 2.7C5.6 21 15 21 15 21s9.4 0 11.7-.6a3.8 3.8 0 0 0 2.7-2.7c.6-2.3.6-7.2.6-7.2s0-4.9-.6-7.2z"/><path fill="#fff" d="M12 15l7.8-4.5L12 6z"/></svg>'
  };
  window.LX_ICON = ICON;

  var CARS = [
    ['ES', 'NT$177~250 萬', ROOT + 'showroom/ES.html'], ['IS', '', LIVE + '/showroom/IS'], ['LS', '', LIVE + '/showroom/LS'],
    ['RX', '', LIVE + '/showroom/RX'], ['NX', '', LIVE + '/showroom/NX'], ['UX', '', LIVE + '/showroom/UX'],
    ['LBX', '', LIVE + '/showroom/LBX'], ['LM', '', LIVE + '/showroom/LM'], ['RZ', '', LIVE + '/showroom/RZ']
  ];
  var BUY = [['預約試乘', ROOT + 'testdrive.html'], ['據點查詢', LIVE + '/location.aspx'], ['購車優惠', LIVE + '/buycar/sp/index.aspx'], ['車款比較', LIVE + '/buycar/'], ['購車和泰 PAY 支付', LIVE + '/buycar/']];
  var BRAND = [['品牌介紹', '/brand.aspx'], ['LEXUS 多元動力', '/electrified/'], ['性能與駕馭', '/driving-pleasure.aspx'], ['LEXUS 純電生活圈', '/service/bev.aspx'], ['LEXUS 安全科技', '/safety-technology.aspx'], ['LEXUS 驚嘆生活誌', '/LexusMagazine'], ['LEXUS 精品', '/lexuslink/'], ['LEXUS LINE', '/LINE/'], ['LEXUS Careers', '/careers.aspx']];
  var SERVICE = [['服務特色', '/service.aspx'], ['Lexus Plus App', '/app/lexusplus/'], ['LEXUS LINK', '/lexuslink/'], ['科技功能介紹', '/technology_video/'], ['預約回廠', '/owners.aspx#/booking'], ['保證方案/延長保證', '/service/warranty.aspx'], ['保養計劃', '/service/maintenance-plan.aspx'], ['電動車主服務', '/service/bev.aspx'], ['和泰 Points 點數', '/service/hotai-points.aspx'], ['車主尊享活動', '/service/eliterewards.aspx']];
  var OTHER = [['認證中古車', 'https://www.lexuscpo.com.tw/'], ['最新消息', LIVE + '/news.aspx'], ['車主專區', LIVE + '/owners.aspx#/index'], ['聯絡我們', LIVE + '/contact.aspx']];
  function live(list) { return list.map(function (l) { return [l[0], l[1].charAt(0) === '/' ? LIVE + l[1] : l[1]]; }); }
  BRAND = live(BRAND); SERVICE = live(SERVICE);

  function slug(s) { return s.replace(/\s+/g, '').replace(/[^\w一-鿿]/g, '').toLowerCase(); }
  function links(list, ga) { return list.map(function (l) { return '<a href="' + l[1] + '" data-ga-id="' + ga + '_' + slug(l[0]) + '">' + l[0] + '</a>'; }).join(''); }
  var logo = '<a class="site-header__logo" href="' + ROOT + 'index.html" aria-label="LEXUS 首頁" data-ga-id="header_logo"><span class="js-logo"></span></a>';

  // ---------- header ----------
  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<button class="icon-btn site-header__menu-left js-menu-open" data-panel="main" aria-label="開啟選單" data-ga-id="header_menu">' + ICON.menu + '</button>' +
    logo +
    '<div class="site-header__tools">' +
    '<button class="icon-btn js-menu-open" data-panel="member" aria-label="會員" data-ga-id="header_member">' + ICON.member + '</button>' +
    '<button class="icon-btn js-menu-open" data-panel="main" aria-label="開啟選單" data-ga-id="header_menu">' + ICON.menu + '</button>' +
    '</div>';
  document.body.prepend(header);

  // ---------- menu ----------
  function item(title, inner, ga, open) {
    return '<div class="menu__item' + (open ? ' is-open' : '') + '"><button class="menu__head" aria-expanded="' + !!open + '" data-ga-id="menu_' + ga + '">' + title + ICON.chev + '</button>' +
      '<div class="menu__panel"><div>' + inner + '</div></div></div>';
  }
  var cars = '<div class="menu__cars">' + CARS.map(function (c) {
    return '<a href="' + c[2] + '" data-ga-id="menu_car_' + c[0].toLowerCase() + '">' + c[0] + (c[1] ? '<small>' + c[1] + '</small>' : '') + '</a>';
  }).join('') + '</div>';
  var menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.innerHTML =
    '<div class="menu__bar"><button class="icon-btn menu__close js-menu-close" aria-label="關閉選單" data-ga-id="menu_close">' + ICON.close + '</button>' + logo +
    '<div class="site-header__tools"><button class="icon-btn js-menu-open" data-panel="member" aria-label="會員" data-ga-id="menu_member">' + ICON.member + '</button></div></div>' +
    '<div class="menu__body" data-panel="main">' +
    item('車款介紹', cars, 'models') +
    item('購車資訊', '<div class="menu__links">' + links(BUY, 'menu_buy') + '</div>', 'buy', true) +
    item('探索LEXUS', '<div class="menu__links">' + links(BRAND, 'menu_brand') + '</div>', 'brand') +
    item('車主尊享服務', '<div class="menu__links">' + links(SERVICE, 'menu_service') + '</div>', 'service') +
    '</div>' +
    '<div class="menu__body" data-panel="member" hidden>' +
    '<p class="menu__greet">和泰集團會員您好，歡迎登入！</p>' +
    '<div class="menu__links">' + links([['車主專區', LIVE + '/owners.aspx#/index'], ['購車和泰 Pay 支付', LIVE + '/buycar/']], 'menu_member') + '</div>' +
    '</div>';
  document.body.appendChild(menu);

  function openMenu(panel) {
    menu.querySelectorAll('.menu__body').forEach(function (b) { b.hidden = b.getAttribute('data-panel') !== panel; });
    menu.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMenu() { menu.classList.remove('is-open'); document.documentElement.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('.js-menu-open');
    if (o) { e.preventDefault(); openMenu(o.getAttribute('data-panel')); return; }
    if (e.target.closest('.js-menu-close')) closeMenu();
    var h = e.target.closest('.menu__head');
    if (h) { var it = h.parentNode; it.classList.toggle('is-open'); h.setAttribute('aria-expanded', it.classList.contains('is-open')); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeModal(); } });

  // logo: inline the mirror's SVG so it follows currentColor
  fetch(MIRROR + 'images/layout/menu/logo_2025.svg').then(function (r) { return r.text(); }).then(function (svg) {
    svg = svg.replace(/<\?xml[^>]*>/, '').replace('<svg', '<svg fill="currentColor"');
    document.querySelectorAll('.js-logo').forEach(function (s) { s.outerHTML = svg; });
  });

  // ---------- quick links ----------
  var quick = document.createElement('nav');
  quick.className = 'quick';
  quick.setAttribute('aria-label', '快速連結');
  quick.innerHTML = '<a href="' + LIVE + '/buycar/sp/index.aspx" data-ga-id="quick_offer">購車優惠</a><a href="' + ROOT + 'testdrive.html" data-ga-id="quick_testdrive">試乘．諮詢</a><a href="' + LIVE + '/location.aspx" data-ga-id="quick_location">據點查詢</a>';
  document.body.appendChild(quick);

  // ---------- footer ----------
  var footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML =
    '<div class="wrap footer__grid"><div>' +
    '<nav class="footer__models">' + CARS.concat([['Lexus Electrified Sport Concept', '', LIVE + '/LEXUSELECTRIFIEDSPORTCONCEPT/'], ['LF-ZC', '', LIVE + '/LF-ZC/']]).map(function (c) {
      return '<a href="' + c[2] + '" data-ga-id="footer_model_' + slug(c[0]) + '">' + c[0] + '</a>';
    }).join('') + '</nav>' +
    '<div class="footer__cols"><ul>' + wrapLi(links(BUY, 'footer_buy')) + '</ul><ul>' + wrapLi(links(BRAND, 'footer_brand')) + '</ul><ul>' + wrapLi(links(SERVICE, 'footer_service')) + '</ul><ul>' + wrapLi(links(OTHER, 'footer_other')) + '</ul>' +
    '<div class="footer__sns"><a href="' + LIVE + '/LINE/" aria-label="LINE" data-ga-id="footer_sns_line">' + ICON.line + '</a><a href="https://www.instagram.com/lexus_taiwan/" aria-label="Instagram" data-ga-id="footer_sns_ig">' + ICON.ig + '</a>' +
    '<a href="https://www.facebook.com/lexus.tw" aria-label="Facebook" data-ga-id="footer_sns_fb">' + ICON.fb + '</a><a href="https://www.youtube.com/user/LEXUSTaiwanchannel" aria-label="YouTube" data-ga-id="footer_sns_yt">' + ICON.yt + '</a></div></div>' +
    '</div><div class="footer__brand"><span>EXPERIENCE<br>AMAZING</span><a class="footer__top" href="#top" data-ga-id="footer_top">' + ICON.chev.replace('<svg', '<svg style="width:14px;transform:rotate(180deg)"') + 'TOP</a></div></div>' +
    '<div class="wrap footer__legal"><nav><a href="http://www.lexus-int.com/" data-ga-id="footer_global">全球 LEXUS</a><a href="' + LIVE + '/privacy.aspx" data-ga-id="footer_privacy">隱私權條款</a><a href="' + LIVE + '/upload/car_purchase_contract/220808-LEXUS汽車買賣契約書(範本)(含約定事項).pdf" data-ga-id="footer_contract">車輛買賣契約書</a></nav>' +
    '<span>© HOTAI MOTOR CO.,LTD. ALL RIGHTS RESERVED.　　和泰汽車股份有限公司 03251108</span></div>';
  document.body.appendChild(footer);
  function wrapLi(html) { return html.replace(/<a /g, '<li><a ').replace(/<\/a>/g, '</a></li>'); }
  document.body.id = 'top';

  // header turns solid once the hero is scrolled past
  var hero = document.querySelector('.hero');
  function onScroll() { header.classList.toggle('is-solid', !hero || window.scrollY > hero.offsetHeight - header.offsetHeight); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- toast / modal ----------
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;
  window.lxToast = function (msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2200);
  };
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal__box" role="dialog" aria-modal="true"><button class="modal__close" aria-label="關閉" data-ga-id="modal_close">' + ICON.close + '</button><div class="js-modal-body"></div></div>';
  document.body.appendChild(modal);
  window.lxModal = function (html) { modal.querySelector('.js-modal-body').innerHTML = html; modal.classList.add('is-open'); };
  function closeModal() { modal.classList.remove('is-open'); }
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.modal__close')) closeModal(); });

  // ---------- hero slider ----------
  document.querySelectorAll('[data-hero]').forEach(function (el) {
    var slides = el.querySelectorAll('.hero__slide');
    var dots = el.querySelectorAll('.hero__dots button');
    if (slides.length < 2) return;
    var i = 0, timer;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        s.querySelectorAll('video').forEach(function (v) { if (k === i && v.offsetParent) { v.play().catch(function () {}); } else v.pause(); });
      });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-current', k === i); });
      clearTimeout(timer);
      timer = setTimeout(function () { go(i + 1); }, 7000);
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    go(0);
  });

  // ---------- dot fader (ES intro) ----------
  document.querySelectorAll('[data-fader]').forEach(function (el) {
    var imgs = el.querySelectorAll('img'), dots = el.querySelectorAll('.dots button');
    function go(n) {
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === n); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === n); });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  });

  // ---------- peek carousel (promo / cabin) ----------
  document.querySelectorAll('[data-peek]').forEach(function (el) {
    var track = el.querySelector('.peek__track'), slides = el.querySelectorAll('.peek__slide');
    var bg = el.querySelector('.peek__bg'), num = el.querySelector('.cabin__num'), i = 0;
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      var img = slides[i].querySelector('img');
      if (bg && img) bg.style.backgroundImage = 'url("' + img.currentSrc + '")';
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    }
    el.querySelector('.peek__nav--prev').addEventListener('click', function () { go(i - 1); });
    el.querySelector('.peek__nav--next').addEventListener('click', function () { go(i + 1); });
    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    var first = slides[0] && slides[0].querySelector('img');
    if (first && !first.complete) first.addEventListener('load', function () { go(i); }); else go(0);
  });

  // ---------- generic tabs: [role=tablist] buttons with aria-controls or data-filter ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[role="tab"]');
    if (!t) return;
    var list = t.closest('[role="tablist"]');
    list.querySelectorAll('[role="tab"]').forEach(function (b) { b.setAttribute('aria-selected', b === t); });
    list.dispatchEvent(new CustomEvent('lx:tab', { detail: t, bubbles: true }));
  });

  window.LX = { ROOT: ROOT, MIRROR: MIRROR, LIVE: LIVE };
})();
