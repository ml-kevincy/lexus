/*
$(document).pngFix();ie6 png fix
$(this).lightBox();jq lightbox
$(this).fxFile(70);input type="file"
$(this).fxSlide(5, 300, 'v');slide can be vertical'v' or horizontal'h'
$(this).fxCss(target); clone target's css
$(this).mousewheel(function(e, delta){}); mousewheel event
$(this).bgiframe();
getUrlVars()["id"];
getAjaxVars(e)["me"];
--------jq effect
$(this).effect('blind');
blind bounce clip drop explode fade fold highlight pulsate scale shake slide transfer puff
--------jq easing 
$(this).animate({left:''}, 500, 'easeInQuad', callback);
easeInQuad	easeOutQuad	easeInOutQuad	easeInCubic	easeOutCubic	easeInOutCubic	easeInQuart	easeOutQuart	easeInOutQuart	easeInQuint	easeOutQuint	easeInOutQuint	easeInSine	easeOutSine	easeInOutSine	easeInExpo	easeOutExpo	easeInOutExpo	easeInCirc	easeOutCirc	easeInOutCirc	easeInElastic	easeOutElastic	easeInOutElastic	easeInBack	easeOutBack	easeInOutBack	easeInBounce	easeOutBounce	easeInOutBounce
--------share
anteaterAddBookmark("FaceBook");
anteaterAddBookmark("Twitter");
anteaterAddBookmark("Plurk");
--------outside event
clickoutside, dblclickoutside, focusoutside, bluroutside, mousemoveoutside, mousedownoutside, mouseupoutside, mouseoveroutside, mouseoutoutside, keydownoutside, keypressoutside, keyupoutside, changeoutside, selectoutside, submitoutside
--------own selector
$.extend($.expr[':'], {  
    over100pixels: function(a) {  
        return $(a).height() > 100;  
    }  
}); 
*/

var fdm;
var ga;
var kill;
var doneScroll;
jQuery.browser = {}; (function () { jQuery.browser.msie = false; jQuery.browser.version = 0; if (navigator.userAgent.match(/MSIE ([0-9]+)./)) { jQuery.browser.msie = true; jQuery.browser.version = RegExp.$1; } })();
$(document).ready(function () {
  var $ = jQuery;
  var win = {
    d: $(window),
    timer: null,
    mobile: false,
    ios7: false,
    box: $('#Box'),
    fn: new Array(),
    ua: navigator.userAgent,
    cookie: false,
    cookieStr: 'readcookie=true'
  };
  var fdmData = '';
  var fdmsend;
  if (typeof (fdm) == 'function') fdmsend = new fdm($);
  var setCookie;
  var getCookie;

  const MAX_COOKIE_COUNT = 100; // 限制最多處理多少 cookie
  const ALLOWED_COOKIE_KEYS = ['fylast', 'fmlast', 'fdlast', 'fvlast', 'ffloorlast']; // 白名單 cookie

  document.cookie = win.cookieStr;
  if (document.cookie.indexOf(win.cookieStr) != -1) {
    win.cookie = true;

    (function () {
      // setCookie = function (name, value) {
      //   if (!/^https/.test(location.protocol)) {
      //     document.cookie = name + '=' + value;
      //   } else {
      //     document.cookie = name + '=' + value + ';secure';
      //   }
      // };
      setCookie = function (name, value, days = 7, secure = location.protocol === 'https:') {
        if (!ALLOWED_COOKIE_KEYS.includes(name)) return;

        // 過濾 cookie 值中的危險字元
        const safeValue = encodeURIComponent(
          String(value).substring(0, MAX_COOKIE_COUNT).replace(/[^\w@.\-]/g, '')
        );

        const expires = new Date(Date.now() + days * 864e5).toUTCString(); // 預設 7 天
        const cookieParts = [
          `${name}=${safeValue}`,
          `expires=${expires}`,
          `path=/`
        ];

        if (secure) {
          cookieParts.push('Secure');
        }

        // 建議搭配 SameSite 限制（防 CSRF）
        cookieParts.push('SameSite=Strict');

        document.cookie = cookieParts.join('; ');
      }
      var cookies;
      var cookieA;
      var length;
      var checkName;
      // getCookie = function (name) {
      //   cookies = document.cookie.split(';');
      //   length = cookies.length;
      //   for (var i = 0; i < length; i++) {
      //     checkName = cookies[i].split('=');
      //     if (checkName[0].indexOf(' ') == 0) {
      //       checkName[0] = checkName[0].slice(1);
      //     }
      //     if (name == checkName[0]) {
      //       return checkName[1];
      //     };
      //   };
      //   return 'nocookie';
      // }
      getCookie = function (name) {
        if (!ALLOWED_COOKIE_KEYS.includes(name)) {
          return 'nocookie';
        }
      
        const cookieStr = document.cookie || '';
        const cookies = cookieStr.split(';');
        const max = Math.min(cookies.length, MAX_COOKIE_COUNT);
      
        for (let i = 0; i < max; i++) {
          const cookie = cookies[i];
          if (!cookie.includes('=')) continue;
      
          const [keyRaw, valRaw] = cookie.split('=');
          const key = keyRaw.trim();
          const val = valRaw?.trim() ?? '';
      
          if (key === name) {
            try {
              // decode + 過濾可疑字元（僅允許常見符號）
              return decodeURIComponent(val).replace(/[^\w@.\-]/g, '');
            } catch (e) {
              return 'nocookie';
            }
          }
        }
      
        return 'nocookie';
      }
    })();
  }

  win.locate = window.location.href.toLowerCase();
  win.locate = win.locate.slice(win.locate.indexOf('://') + 3);
  win.locate = win.locate.slice(win.locate.indexOf('/'));
  var galooping = 0;
  /*function gaLoop(){*/
  if (ga && typeof (ga) == 'function') {
    //clearInterval(gaTimer);

    //ga('send', 'event', 'category', 'action', 'label', value, true);
    //action = site info
    //label = user info
    var now = new Date();
    win.now = {
      action: '',
      label: '',
      day: now.getDay(),
      browser: '[browser:data]',
      history: null,
      lang: null,
      lastvisit: false
    };
    win.today = {
      y: now.getFullYear(),
      m: now.getMonth(),
      d: now.getDate()
    }
    win.now.day2 = (win.now.day >= 1 && win.now.day <= 5) ? '平日' : '周末';
    win.now.time = now.getHours();
    win.now.time2 = (win.now.time > 6 && win.now.time < 19) ? '白天' : '晚上';
    /*win.browser = $.browser;
    for (e in win.browser){
      win.now.browser+=win.browser[e]+' ' ;
    }*/
    if (document && document.referrer && document.referrer.length > 0) {
      win.now.history = document.referrer;
    }
    if (navigator.userLanguage && navigator.userLanguage.length > 0) {
      win.now.lang = navigator.userLanguage;
    } else if (navigator.language && navigator.language.length > 0) {
      win.now.lang = navigator.language;
    }
    if (window.screen && window.screen.width) {
      win.now.screen = {
        w: window.screen.width,
        h: window.screen.height
      }
    };
    if (win.cookie) {
      if (getCookie('fylast') != 'nocookie') {
        if (getCookie('fylast') != win.today.y | getCookie('fmlast') != win.today.m | getCookie('fdlast') != win.today.d) {
          //reset day
          setCookie('fylast', win.today.y);
          setCookie('fmlast', win.today.m);
          setCookie('fdlast', win.today.d);
          setCookie('ffloorlast', 0);
          win.now.lastvisit = 0;
        } else {
          //on going
          win.now.lastvisit = ~~(getCookie('ffloorlast')) + 1;
          setCookie('ffloorlast', win.now.lastvisit);
        }
      } else {
        setCookie('fylast', win.today.y);
        setCookie('fmlast', win.today.m);
        setCookie('fdlast', win.today.d);
        setCookie('ffloorlast', 0);
      }
    }

    win.now.action += win.locate + '/';
    fdmData += '/[^url]' + win.locate;

    win.now.label += win.now.day2 +
      '/星期' + win.now.day + '/' + win.now.time2 + '/' + win.now.time + '點' +
      '/' + win.now.browser + win.ua +
      ((win.now.lastvisit) ? '/[floor]' + win.now.lastvisit : '') +
      ((win.cookie) ? '/[cookie]true' : '/[cookie]false') +
      ((win.now.history) ? '/[history]' + win.now.history : '') +
      ((win.now.lang) ? '/[lang]' + win.now.lang : '') +
      ((win.now.screen) ? '/[screen]' + win.now.screen.w + 'x' + win.now.screen.h : '') +
      '/[window]' + win.d.width() + 'x' + win.d.height() +
      '/[userID]';
    fdmData +=
      '/[^sales]' + (id('appuse') ? 'true' : 'false') +
      '/[^weeks]' + win.now.day2 +
      '/[^day]' + win.now.day +
      '/[^dayshift]' + win.now.time2 +
      '/[^time]' + win.now.time +
      '/[^browser]' + win.now.browser +
      '/[^useragent]' + win.ua +
      '/[^floor]' + ((win.now.lastvisit) ? win.now.lastvisit : 'unknown') +
      '/[^cookie]' + ((win.cookie) ? 'true' : 'false') +
      '/[^history]' + ((win.now.history) ? win.now.history : 'unknown') +
      '/[^lang]' + ((win.now.lang) ? win.now.lang : 'unknown') +
      '/[^screen]' + ((win.now.screen) ? +win.now.screen.w + 'x' + win.now.screen.h : 'unknown') +
      '/[^window]' + win.d.width() + 'x' + win.d.height();

    function startGAinit() {
      ga('send', 'event', '_visit2',
        '[site:data]' + win.now.action + '/[user:data]' + win.now.label + win.clientId, getCookie('fvlast')
      );
      fdmData += '/[^userid]' + win.clientId + '/[^useridold]' + getCookie('fvlast');
      if (fdmsend && typeof (fdmsend.send) == 'function') {
        fdmsend.send('/[^datatype]visit' + fdmData);
        $.ajax({
          url: '/random.ashx',
          success: function (r) {
            fdmsend.send('/[^datatype]bind' + '/[^random]' + r + '/[^userid]' + win.clientId);
          }
        });
      };
    };

    ga('set', 'siteSpeedSampleRate', 3);
    ga(function (tracker) {
      win.clientId = tracker.get('clientId');
      setCookie('fvlast', win.clientId);
      startGAinit();
    });


  }
  /*if( ++galooping >= 100){
    clearInterval(gaTimer);
  };*/
  //}//gaLoop


  //var gaTimer =setInterval(gaLoop,50);

  // if no-header
  if (!$("#Menu")[0]) {
    $('html').addClass('no-header');
  }


  var check = {
    tablet: 768,
    phone: 600
  };
  var doc = $(document);
  var aEase = 'easeOutQuart'; //'easeOutExpo'easeOutQuad
  //document.title ='win.width:'+win.d.width();
  var scrollBody = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
  var evt = {
    click: 'click',
    click2: 'click'
  };

  var ua = win.ua.toLowerCase();
  if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
    win.ios7 = true;
  }
  if (ua.indexOf('iphone') != -1 || ua.indexOf('ipod') != -1 || ua.indexOf('ipad') != -1 || ua.indexOf('android') != -1) {
    win.mobile = true;
    evt.click2 = 'touchstart';
    if (ua.indexOf('ipad') != -1) win.ipad = true;
    if (win.d.width() > 641) {
      win.tablet = true;
    } else {
      win.phone = true;
    };
  };
  if (ua.indexOf('iphone') != -1 || ua.indexOf('ipod') != -1 || ua.indexOf('ipad') != -1) {
    win.ios = true;
  } else if (ua.indexOf('android') != -1) {
    win.android = true;
  } else if (ua.indexOf('windows phone') != -1) {
    win.win = true;
  };

  if ($.browser.msie) {
    win.ie = true;
    win.iev = $.browser.version;
  }

  function fga(category, action, label, value) {
    if (ga && typeof (ga) == 'function') {
      //ga('send', 'event', 'category', 'action', 'label', value);
      /*if(console && console.log){
        console.log('ga:'+category+'/'+action+'/'+label+'/'+value);
      }*/
      if (action) {
        if (label) {
          ga('send', 'event', category, action, label, value);
        } else {
          ga(function (tracker) {
            win.clientId = tracker.get('clientId');

            ga('send', 'event', category, action.slice(0, action.length - 9) + win.clientId, win.clientId);
          });
        }
      } else {
        ga('send', 'pageview', category);
      }

    }
  }

  function id(d) {
    return document.getElementById(d);
  };

  function ifid(d, fn) {
    if (document.getElementById(d) && typeof (fn) == 'function') {
      fn(document.getElementById(d));
    };
  };

  function ifclass(d, fn) {
    d = $(d);
    if (d.length > 0 && typeof (fn) == 'function') {
      fn(d);
    };
  }

  var slide100 = function (dom, ob, dir, type) {
    var o = {
      body: dom.find('div.aBody'),
      item: dom.find('div.aItem'),
      each: dom.find('div.each'),
      page: dom.find('div.aPage a'),
      left: dom.find('div.aLeft a'),
      right: dom.find('div.aRight a'),
      txt: dom.find('div.eachTxt'),
      img: dom.find('div.each img'),
      id: 0,
      preid: 0
    };
    var hasTouch = 'ontouchstart' in document.documentElement;
    var setting = {
      click: 'click',
      onRun: null,
      speed: 350
    }
    if (type == 'conceptPage2' && win.ie && win.iev <= 8) {
      var wTimer;
      var wh;
      o.img.show();

      o.each.css({
        backgroundImage: 'none'
      });
      win.d.resize(function () {
        clearTimeout(wTimer);
        wTimer = setTimeout(wResize, 500);
      });

      function wResize() {
        wh = win.d.height();
        ih = o.img.eq(0).height();
        o.img.each(function () {
          this.style.marginTop = (wh - ih) / 2 + 'px';
        });
      };
      win.d.load(wResize);
    }
    for (i in ob) setting[i] = ob[i];
    o.max = o.each.length;
    if (o.each.length == 1) {
      o.left.remove();
      o.right.remove();
      dom.find('div.aPage').remove();
    } else {
      o.page.each(function (i) {
        $(this).bind(setting.click, function () {
          o.id = i;
          runSlide();
          return false;
        });
      });
      o.left.bind(setting.click, function () {
        o.id--;
        runSlide();
      });
      o.right.bind(setting.click, function () {
        o.id++;
        runSlide();
      });
    }
    if (dir == 'v') {
      o.each.each(function (i) {
        this.style.position = 'static';
      });
    } else {
      o.each.each(function (i) {
        if (i == 0) {
          this.style.position = 'relative';
        }
        this.style.left = i * 100 + '%';
      });
    }
    if (setting.loop > 1) {

      setInterval(function () {
        o.id++;
        runSlide();
      }, setting.loop);
    }

    if (hasTouch) {
      //alert(o.item[0]);
      var p = {
        sx: 0,
        mx: 0,
        r: 30
      }
      var touchmove;
      if (dir == 'v') {
        p.r = 50;
        touchmove = function (e) {
          p.mx = e.touches[0].pageY;
          o.item[0].style.top = -o.id * 100 + (p.mx - p.sx) + '%';
          if (p.mx - p.sx > p.r) {
            o.item[0].removeEventListener('touchmove', touchmove, false);
            o.id--;
            runSlide();

          } else if (p.sx - p.mx > p.r) {
            o.item[0].removeEventListener('touchmove', touchmove, false);
            o.id++;
            runSlide();

          }
        }
      } else {
        touchmove = function (e) {
          p.mx = e.touches[0].pageX;
          if (p.mx - p.sx > p.r) {
            o.item[0].removeEventListener('touchmove', touchmove, false);
            o.id--;
            runSlide();

          } else if (p.sx - p.mx > p.r) {
            o.item[0].removeEventListener('touchmove', touchmove, false);
            o.id++;
            runSlide();

          }
        }
      }

      o.item[0].addEventListener('touchstart', function (e) {
        if (dir == 'v') {
          e.preventDefault();
          p.sx = e.touches[0].pageY;
        } else {
          p.sx = e.touches[0].pageX;
        }
        o.item[0].addEventListener('touchmove', touchmove, false);
      }, false);

      o.item[0].addEventListener('touchend', function (e) {
        o.item[0].removeEventListener('touchmove', touchmove, false);
        o.item[0].style.top = -o.id * 100 + '%';
      }, false);

    }

    function runSlide() {
      if (o.id < 0) {
        o.id = o.max - 1;
      } else {
        o.id = o.id % o.max;
      };

      if (o.id != o.preid) {
        if (typeof (setting.onRun) == 'function') {
          setting.onRun(o.id);
        }
        o.page.removeClass('ON').eq(o.id).addClass('ON');
        if (dir == 'v') {
          o.item.animate({
            top: -o.id * 100 + '%'
          }, setting.speed, 'easeOutQuart');
        } else {
          o.item.animate({
            left: -o.id * 100 + '%'
          }, setting.speed, 'easeOutQuart');
        };
        o.txt.hide().eq(o.id).fadeIn(350);
        o.preid = o.id
      }

    };
    o.txt.hide().eq(o.id).show();
  };

  var indexLoading;
  ifid('loading', function (d) {
    var loading = $(d);

    function complete(fn) {
      const easing = ($.easing && $.easing.easeOutQuart) ? 'easeOutSine' : '';
      loading.fadeOut(500, easing, function () {
        $(this).remove();
        if (typeof (fn) == 'function') {
          fn();
        }
      });
    }
    if (id('indexKv')) {
      var _timer = setTimeout(function () {
        clearTimeout(_timer);
        complete(indexLoading);
      }, 500);
    } else if (id('index-root') || id('showroom-model-root') || id('amazinglexus-root')) {
      $(window).load(complete);
    } else if (id('indexBanner')) {
      $('#preloader').fxImgLoader({
        imgDOM: $('#indexBanner .slice').eq(0).find('img'),
        onFinish: function () {
          complete(indexLoading);
        }
      });
    } else if (id('roomBanner')) {
      $('#preloader').fxImgLoader({
        imgDOM: $('#roomBanner .img img'),
        onFinish: complete
      });
    } else if (id('oeFilterCont')) {
      var imgs = $('#oeFilterCont').find('.img img');
      if (imgs.length > 0) {
        $('#preloader').fxImgLoader({
          imgDOM: imgs,
          onFinish: complete
        });
      } else {
        setTimeout(complete, 600);
      };
      imgs = null;

    } else if (id('indexNewsBottom')) {
      $('#preloader').fxImgLoader({
        imgDOM: $('#indexNewsBottom').find('.img img'),
        onFinish: complete
      });
    } else {
      setTimeout(complete, 600);
    }
  });


  var indexBannerOp;
  ifid('indexBanner', function (d) {
    indexBannerOp = {};
    var imgAdjustTop = $('#indexBanner img.imgAdjustTop');
    var imgAdjustTopx = $('#imgAdjustTop');
    var indexBanner = $('#indexBanner');
    var imgBG = indexBanner.find('div.eachBG');
    var imgMask = indexBanner.find('div.mask');
    var eachTxt = indexBanner.find('div.eachTxtBox');
    var flipImg = new Array();
    var sliceDiv = indexBanner.find('div.slice');
    var imgLength = sliceDiv.eq(0).find('img').length;
    var imgList = indexBanner.find('div.aList a');
    var sliceLength = sliceDiv.length;
    var setImg = new Array();
    var btn = indexBanner.find('div.sliceBtn a').addClass('a300');
    var nowIndex = 0;
    var onIndex = true;
    var isTimed = true;
    var stopped = true;
    var slideTimer;
    var slideTimeOut = 7000;
    var slideTransition = ($.browser.webkit) ? '-webkit-transition' : ($.browser.mozilla) ? '-moz-transition' : ($.browser.msie) ? '-ms-transition' : ($.browser.opera) ? '-o-transition' : 'transition';
    var timeBar = {
      d: id('indexBannerTimeBar'),
      bar: indexBanner.find('div.timeBar > div')
    }
    for (var i = 0; i < imgLength; i++) {
      flipImg[i] = new Array();
    };
    sliceDiv.each(function (i) {
      $(this).find('img').each(function (j) {
        flipImg[j][i] = this;
      });
    });
    for (var i = 0; i < imgLength; i++) {
      setImg.push(
        $(flipImg[i])
      );
    };
    indexBanner.find('div.aLeft a').bind(evt.click, function () {
      if (stopped && i != nowIndex) {
        stopped = false;
        nowIndex--;
        runSlide();
      }
    });
    indexBanner.find('div.aRight a').bind(evt.click, function () {
      if (stopped && i != nowIndex) {
        stopped = false;
        nowIndex++;
        runSlide();
      }
    });

    imgList.each(function (i) {
      $(this).bind(evt.click, function () {
        if (stopped && i != nowIndex) {
          stopped = false;
          nowIndex = i;
          runSlide();
        }

      });
    });

    function showImg() {
      for (e in setImg) {
        if (e == nowIndex) {
          setImg[e].show();
        } else {
          setImg[e].hide();
        }
      };

    };
    imgBG.hide().eq(0).show();
    sliceDiv.addClass('flipOver flipTran');

    function runSlide() {
      //resetSlideTimer();
      if (nowIndex >= imgLength) {
        nowIndex = 0;
      } else if (nowIndex < 0) {
        nowIndex = imgLength - 1;
      };

      imgList.removeClass('ON').eq(nowIndex).addClass('ON');
      eachTxt.fadeOut(300);
      showImg();
      imgMask.addClass('a700').each(function (i) {
        var tt = $(this);
        var speed = imgLength * 100 + 700 + i * 100;
        var t2 = sliceDiv.eq(i).css(slideTransition, 'all ' + (i * 100 + 500) + 'ms cubic-bezier(0.000, 0.865, 0.175, 0.890)');
        var index = i;

        setTimeout(function () {

          t2.removeClass('flipTran');


        }, 100 * i);

        setTimeout(function () {
          t2.css(slideTransition, 'all 700ms cubic-bezier(0.240, 0.685, 0.495, 1.000)').removeClass('flipOver');
          setTimeout(function () {
            if (index + 1 == sliceLength) {
              imgBG.hide().eq(nowIndex).show();
              sliceDiv.css(slideTransition, 'none').addClass('flipOver flipTran');
              eachTxt.eq(nowIndex).fadeIn(500);
              stopped = true;
            };
          }, 700);
        }, speed);
      });
      resetSlideTimer();


    };

    showImg();
    indexBannerOp.stop = function () {
      timeBar.bar.stop();
      clearInterval(slideTimer);
    }

    var resetSlideTimer = function () {
      clearInterval(slideTimer);
      slideTimer = setInterval(function () {
        nowIndex++;
        runSlide();
      }, slideTimeOut);
      timeBar.d.style.left = nowIndex * 20 + "%";
      timeBar.bar.stop().css({
        width: '0%'
      }).animate({
        width: 100 / sliceLength + '%'
      }, slideTimeOut);
    };
    resetSlideTimer();
    indexBannerOp.reset = resetSlideTimer;

    function winResize() {
      win.w = win.d.width();
      if (win.d.width() < 768) {
        win.h = win.d.height() - 60;
      } else {
        if (win.tablet) {
          win.h = win.d.height() - 20;
        } else {
          win.h = win.d.height();
        }

      }
      d.style.height = win.h - 20 + 'px';
      imgAdjustTop.css({
        top: -(imgAdjustTopx.height() - win.h - 20) / 2 + 'px'
      });
      /*if( imgAdjustTop.eq(nowIndex).height() < win.h ){
        
      } else {
        imgAdjustTop.css({top:( win.h - imgAdjustTop.eq(nowIndex).height()) / 2 + 'px'});
      }*/

    }
    win.d.load(function () {
      winResize();
    }).resize(function () {
      clearTimeout(win.timer);
      win.timer = setTimeout(winResize, 500);
    });



    /*win.d.scroll(function (e){
      win.srollTop = $(this).scrollTop();
      if(win.scrollTop < win.d.height()-132 ){
        clearTimeout(win.timer);		
        win.timer = setTimeout(function (){

        }, 500);
      } else {
        
      }
    });*/


    /*indexBanner.mousewheel(function(e,d){
      //document.title = d;
      e.preventDefault();
      if(d < 0){
        scrollBody.stop().animate({scrollTop:win.d.height()-132+'px'}, 700);
      } else {
        scrollBody.stop().animate({scrollTop:'0px'}, 700);
      };
      return;
    });*/

  });





  ifid('indexNewsBottom', function (d) {
    var atNews = id('newsLoaderBox') ? true : false;
    var newsSet = $('#indexNewsBtn');
    $('#mobileNews').bind(evt.click, function () {
      scrollBody.animate({
        scrollTop: newsSet.offset().top - 80 + 'px'
      }, 300);
    });


    var t = $('#indexNewsBottom').addClass('a500');
    var w1 = t.find('div.w1');
    var w2 = t.find('div.w2');
    var now = {
      x: 0,
      y: 0,
      i: 0
    };
    now.w = t.width();
    var imgs = $(t.find('div.each > .img'));
    var dom = new Array();
    var btn = $('#indexNewsBtn a');
    var btns = btn.length;
    var indexShareWidth = $('div.indexShareWidth');
    var store;
    var storeNext;
    var storeLeft;
    var newsLoader;
    var newsMoreBtn;
    var hasMore = false;
    for (var i = 0; i < btns; i++) {
      switch(i) {
        case 0: dom[0] = t.children('div.s0'); break;
        case 1: dom[1] = t.children('div.s5'); break;
        case 2: dom[2] = t.children('div.s6'); break;
        case 3: dom[3] = t.children('div.s7'); break;
      }
      // dom[i] = t.children('div.s' + i);
    };
    if (t.find('div.each').length >= 30 && atNews) {
      hasMore = true;
      newsLoader = $('#newsLoaderBox');
      t.find('div.each').appendTo(newsLoader);
      dom[0].slice(0, 30).appendTo(t);
      newsMoreBtn = $('#newsMoreBtn a').bind(evt.click, function () {
        var min = t.find('div.each').size();
        dom[0].slice(min, min + 10).appendTo(t);
        runPos();
        if (newsLoader.find('div.each').length == 0) {
          $(this).hide();
          hasMore = false;
        }
      });
    }

    dom[0].addClass('a500');
    now.h = dom[now.i].height();

    function runPos(b) {
      if (b) {

      };
      indexShareWidth.css({
        width: 'auto'
      });
      dom[0].hide();
      now.x = 0;
      now.y = 0;
      now.w = t.width();

      if (now.w < 532) {

        if (!t.hasClass('indexNewsBottom2')) {
          t.addClass('indexNewsBottom2')
        }
        now.w1 = new Array();
        now.w2 = new Array();
        now.w = win.d.width() - 20;
        now.h = now.w / 2;
        now.f = true;
        dom[now.i].show().each(function (i) {
          this.style.left = "0px";
          if ($(this).hasClass('w1')) {
            now.w1.push(this);
          } else {
            now.w2.push(this);
          }
        });
        imgs.css('height', now.h + 'px');

        if (now.w1.length / 2 >= now.w2.length || now.w1.length % 2 == 0) {
          now.wMax = Math.max(Math.ceil(now.w1.length / 2), now.w2.length);

          for (var i = 0; i < now.wMax; i++) {
            if (now.w2[i]) {
              now.w2[i].style.top = now.y + 'px';
              now.y += now.h;
            }

            if (now.w1[i * 2]) {
              now.w1[i * 2].style.top = now.y + 'px';
              if (now.w1[i * 2 + 1]) {
                now.w1[i * 2 + 1].style.left = now.h + 'px';
                now.w1[i * 2 + 1].style.top = now.y + 'px';
              }
              now.y += now.h;
            };
          }
          d.style.height = now.y + 'px';
        } else {
          for (i in now.w2) {
            now.w2[i].style.top = now.y + 'px';
            now.y += now.h;
          }
          for (i in now.w1) {
            now.w1[i].style.top = now.y + 'px';
            if (i % 2 == 1) {
              now.w1[i].style.left = now.h + 'px';
              now.y += now.h;
            };

          }
          d.style.height = now.y + now.h + 'px';
        }
        indexShareWidth.css({
          width: now.w + 'px'
        });

      } else {
        //>532
        if (t.hasClass('indexNewsBottom2')) {
          t.removeClass('indexNewsBottom2')
        };

        store = new Array();
        storeNext = dom[now.i].length;
        now.f = false;
        now.h = dom[now.i].show().eq(0).height();
        now.neww = Math.floor((now.w - 40) / 256) * 256;

        imgs.css('height', '');

        //********************************************
        dom[now.i].each(function (i) {

          now.tw = $(this).width();
          if (now.x + now.tw > now.neww) {

            if ($(this).hasClass('w2') && now.neww - now.x >= 256) {
              store.push({
                d: this,
                b: true
              });
              return;
            }
            now.x = 0;
            now.y += now.h;
          }
          this.style.left = now.x + 'px';
          this.style.top = now.y + 'px';
          now.x += now.tw;

          if (store.length > 0) {
            for (var j = 0; j < store.length; j++) {
              if (store[j].b) {
                now.tw = $(store[j].d).width();

                storeLeft = now.neww - now.x;
                if (storeLeft < 10 || storeLeft > 512) {

                  if (storeLeft < 10) {
                    now.x = 0;
                    now.y += now.h;
                  }
                  store[j].d.style.left = now.x + 'px';
                  store[j].d.style.top = now.y + 'px';
                  now.x += now.tw;
                  now.tw = null;
                  store[j].b = false;
                } else if (i == dom[now.i].length - 1) {

                  now.x = 0;
                  now.y += now.h;
                  store[j].d.style.left = now.x + 'px';
                  store[j].d.style.top = now.y + 'px';
                  now.x += now.tw;
                  now.tw = null;
                  store[j].b = false;
                }
              }
            }
          }
          now.tw = null;
        }); //dom[now.i].each(function(i){

        for (var j = 0; j < store.length; j++) {
          if (store[j].b) {
            now.tw = $(store[j].d).width();
            storeLeft = now.neww - now.x;
            if (storeLeft < 10 || storeLeft > 512) {

              if (storeLeft < 10) {
                now.x = 0;
                now.y += now.h;
              }
              store[j].d.style.left = now.x + 'px';
              store[j].d.style.top = now.y + 'px';
              now.x += now.tw;
              now.tw = null;
              store[j].b = false;
            } else {

              now.x = 0;
              now.y += now.h;
              store[j].d.style.left = now.x + 'px';
              store[j].d.style.top = now.y + 'px';
              now.x += now.tw;
              now.tw = null;
              store[j].b = false;
            }
          }
        } //for




        indexShareWidth.css({
          width: now.neww + 'px'
        });
        d.style.height = now.y + now.h + 'px';
      } //end if

      if (hasMore) {
        if (now.i == 0) {  
          newsMoreBtn.show();
        } else {
          newsMoreBtn.hide();
        }
      }

    };

    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    }
    btn.each(function (i) {
      var txt = $(this).text();
      $(this).bind(evt.click, function () {
        now.i = i;
        t.find('div.each').appendTo(newsLoader);
        if (now.i == 0 && dom[now.i].size() > 30) {
          hasMore = true;
          dom[now.i].slice(0, 30).appendTo(t);
        } else dom[now.i].appendTo(t);
        runPos();
        btn.removeClass('ON').eq(i).addClass('ON');
        fga('/最新消息/' + txt);
        return;
      });

    });



    var indexGarageBoxR = {
      d: $('#indexGarageBoxR').addClass('a500'),
      each: $('#indexGarageBoxR div.each').addClass('a500'),
      x: 0,
      y: 0,
      w: 0
    };

    function indexGarageBoxResize() {

      if (win.d.width() < 801) {
        indexGarageBoxR.d.css({
          height: 'auto'
        });
      } else {
        indexGarageBoxR.w = indexGarageBoxR.d.width();

        indexGarageBoxR.x = 0;
        indexGarageBoxR.y = 0;

        indexGarageBoxR.col = Math.floor(indexGarageBoxR.w / 300);
        indexGarageBoxR.p = (indexGarageBoxR.w - indexGarageBoxR.col * 300) / (indexGarageBoxR.col - 1);
        indexGarageBoxR.h = 150 + indexGarageBoxR.p;

        indexGarageBoxR.each.each(function (i) {

          if (i % indexGarageBoxR.col == 0) {
            indexGarageBoxR.x = 0;
          } else {
            indexGarageBoxR.x = i % indexGarageBoxR.col * (300 + indexGarageBoxR.p);
          }

          this.style.top = Math.floor(i / indexGarageBoxR.col) * 160 + 'px';
          this.style.left = indexGarageBoxR.x + 'px';

        });

        indexGarageBoxR.d.css({
          height: Math.ceil(indexGarageBoxR.each.length / indexGarageBoxR.col) * 160 + 20 + 'px'
        });
      }



    };



    var feslide = {
      d: $('#featuresSlide'),
      aItem: $('#featuresSlide div.aItem'),
      each: $('#featuresSlide div.eachPage'),
      btn: $('#featuresSlide div.aPage a'),
      item: $('#featuresSlide div.each'),
      img: new Array(),
      i: 0
    }
    feslide.each.each(function (i) {
      if (i == 0) {
        this.style.position = 'static';
      }
      this.style.left = i * 100 + '%';

    });

    feslide.btn.each(function (i) {

      $(this).bind(evt.click, function () {
        feslide.btn.removeClass('ON').eq(i).addClass('ON');
        feslide.aItem.animate({
          left: -100 * i + '%'
        }, 1000, 'easeOutExpo');
      });

    });




    win.d.load(function () {
      runPos();
      setTimeout(function () {
        indexGarageBoxResize();
        if (win.d.width() < 801) {
          feslide.item.each(function (i) {
            if (i % 2 == 0) {
              $(this).addClass('left');
            } else {
              $(this).addClass('right');
            }
          });
        } else {
          feslide.item.removeClass('left right');
        }
      }, 100);

    });
    win.d.resize(function () {
      clearTimeout(now.timer);
      now.timer = setTimeout(function () {
        runPos(true);
        indexGarageBoxResize();
        if (win.d.width() < 801) {
          feslide.item.each(function (i) {
            if (i % 2 == 0) {
              $(this).addClass('left');
            } else {
              $(this).addClass('right');
            }
          });
        } else {
          feslide.item.removeClass('left right');
        }
      }, 500);
    });


  });

  /*ifid('ownerIndex', function (d){
    new slide100($('#ownerIndex'), {click:evt.click, loop:3000});
  });*/

  /*ifid('ownerIndex', function (d){
      new slide100($('#ownerIndex'), {click:evt.click, loop:3000});
    });*/

  ifid('roomBanner', function (d) {
    if ($(d).hasClass('collectBanner')) {
      slide100($('#roomBanner'), {
        click: evt.click,
        loop: 3000,
        speed: 700
      });
    } else {
      slide100($('#roomBanner'), {
        click: evt.click
      });
    }
    var locate = window.location.href.toLowerCase();
    locate = locate.slice(locate.indexOf('://') + 3);
    locate = locate.slice(locate.indexOf('/'));
    var dom = $(d);
    dom.find('a.dl').each(function () {
      var txt = $(this);
      $(this).click(function () {
        fga('/型錄下載/' + locate);
      });
    });
    dom.find('a.reserve').each(function (i) {
      var txt = $(this);
      $(this).click(function () {
        if (i == 1) {
          fga('/m/預約試乘/' + locate);
        } else {
          fga('/預約試乘/' + locate);
        }

      });
    });

    /*var banner = {
      body:$('#roomBanner div.aBody'),
      item:$('#roomBanner div.aItem'),
      each:$('#roomBanner div.each'),
      page:$('#roomBanner div.aPage'),
      left:$('#roomBanner div.aLeft a'),
      right:$('#roomBanner div.aRight a'),
      id:0
    };
    banner.max = banner.each.length;

    banner.each.each(function (i){
      if(i==0){
        this.style.position ='static';
      }
      this.style.left = i*100+'%';
    });

    function runSlide(){
      if(banner.id < 0){
        banner.id = banner.max-1;
      } else {
        banner.id = banner.id%banner.max;
      }
      banner.item.animate({left: - banner.id*100+'%'}, 700, aEase);
    };
    */
    /*setInterval(function(){
      banner.id++;
      runSlide();
    }, 3000);*/
  });
  ifclass('#brandParaT2 div.slide100', function (d) {
    d.each(function (i) {
      slide100($(this), {
        click: evt.click
      });
    });
  });

  ifclass('div.roomHeader', function (d) {
    if (id('ownerIndex')) {
      slide100($('#ownerIndex'), {
        click: evt.click,
        loop: 3000
      });
    } else {
      d.each(function (i) {
        slide100($(this), {
          click: evt.click
        });
      });

      /*
      d.each(function (i){
        var txt = $(this).find('div.eachTxt');
        slide100($(this), {click:evt.click,onRun:function (r){
          txt.hide().eq(r).fadeIn(500);
        }});
        txt.hide().eq(0).show();
      });*/
    }

  });

  ifid('newsDetail', function (d) {
    slide100($(d).find('div.slide100'));
  });


  $('.goTop').bind(evt.click, function (e) {
    e.preventDefault();
    scrollBody.animate({
      scrollTop: '0px'
    }, 700);
    return false;
  });


  ifid('roomColor', function (d) {
    // 2016 07 04 新增 飾板
    //console.log( 'roomColor' );

    function bindRoomColorMenu(d, aName) {
      var aItem = d.find('div.aItem');
      var each = d.find('div.each');
      var slice = Math.ceil(each.length / 6);

      for (var i = 0; i < slice; i++) {
        each.slice(i * 6, (i + 1) * 6).wrapAll('<div class="eachPage" />');
      }

      var aEach = d.find('div.eachPage');
      var maxLegnth = d.find('div.eachPage').length;
      var nextAmount = maxLegnth - 6;
      var moveAmount = d.find('div.each').eq(0).height();
      var aLeft = d.find('div.aLeft a');
      var aRight = d.find('div.aRight a');
      var thisId = 0;
      var moveTop = 342;
      var mode = true;

      if (maxLegnth <= 1) {
        aLeft.remove();
        aRight.remove();
      } else {
        aLeft.bind(evt.click, function () {
          thisId--;
          runSlide();
        }).hide();
        aRight.bind(evt.click, function () {
          thisId++;
          runSlide();
        });
      }

      function runSlide() {
        if (thisId <= 0) {
          thisId = 0;
          aLeft.hide();
          aRight.show();
        } else if (thisId >= maxLegnth - 1) {
          thisId = maxLegnth - 1;
          aLeft.show();
          aRight.hide();
        } else {
          aLeft.show();
          aRight.show();
        };
        if (mode) {
          aItem.animate({
            top: -thisId * moveTop + 'px'
          }, 300);
        } else {
          aItem.animate({
            left: -thisId * 100 + '%'
          }, 300);
        }
      }

      function checkScreen() {
        if (win.d.width() < 990) {
          mode = false;
          aItem.stop()[0].style.top = '0px';
          aEach.each(function (i) {
            if (i != 0) {
              this.style.top = '0px';
              this.style.left = i * 100 + '%';
              this.style.position = 'absolute';
            };
          });
        } else {
          aItem.stop()[0].style.left = 'auto';
          aEach.each(function (i) {
            if (i != 0) {
              this.style.left = 'auto';
              this.style.position = 'static';
            };
          });
          mode = true;
        };
        runSlide();
      };
      checkScreen();
      var thisTimer;
      win.d.resize(function () {
        clearTimeout(thisTimer);
        thisTimer = setTimeout(checkScreen, 500);
      });

    } //end bind


    var menu = $('#roomColor div.roomColorMenu').each(function (i) {
      var thisBtn = $('div.each a', this);
      var thisName = $('div.aName>div', this).hide();
      thisName.eq(0).show();
      /*if(!this.id){
        thisBtn.each(function (j){
          $(this).bind(evt.click, function (){
            thisBtn.removeClass('ON').eq(j).addClass('ON');
            contAr[i].hide().eq(j).fadeIn(500);
          });
        });
      };*/

      thisBtn.each(function (j) {
        var t = $(this).find('span.txt');
        if (t.text().length > 5) t.addClass('txt2');
        t = null;
        $(this).bind(evt.click2, function () {
          thisName.hide().eq(j).fadeIn(300);
          thisBtn.removeClass('ON').eq(j).addClass('ON');
          contAr[i].hide().eq(j).fadeIn(500);
        });
      });
      bindRoomColorMenu($(this), thisName);
      thisBtn.eq(0).addClass('ON');

    });
    var contAr = new Array();
    var cont = $('#roomColor div.roomColorCont').each(function (i) {
      contAr[i] = $(this).children('div.each');
      contAr[i].hide().eq(0).show();
    });

    var tab = $('#roomColor div.tab a').each(function (i) {
      $(this).bind(evt.click, function () {
        tab.removeClass('ON').eq(i).addClass('ON');
        menu.hide().eq(i).fadeIn(500);
        cont.hide().eq(i).fadeIn(500);
      });

    });
    cont.hide().eq(0).show();
    menu.hide().eq(0).show();
  });

  ifid('roomColor360', function (d) {
    var imgColor = new Array();
    var reImgColor = new Array();
    var imgColorAll = $('#roomColor360 div.colorArray img');

    $('#roomColor360 div.colorArray').each(function (i) {
      imgColor[i] = new Array();
      $(this).find('img').hide().eq(0).show();
    });
    $('#roomColor360 div.colorArray').each(function (i) {
      $(this).find('img').each(function (j) {
        imgColor[j][i] = this;
      });
    });

    var btn = $('#roomColorMenu360 div.each a').each(function (i) {
      reImgColor[i] = $($.makeArray(imgColor[i]));
      $(this).bind(evt.click, function () {
        btn.removeClass('ON').eq(i).addClass('ON');
        imgColorAll.hide();
        reImgColor[i].show();
      });
    });



    (function () {
      var bar = $('#roomColor360 div.bar');
      var drag = $('#roomColor360 div.drag')[0];
      var nx = 0;
      var maxNum = bar.width();
      var chop = maxNum / 7 | 0;
      var off = bar.offset().left;
      var spin = $('#roomColor360 div.eachColor')[0];
      var tweenTop = $('#roomColor360').height();
      $('#roomColor360 div.roomColor360').bind('mousemove', function (e) {
        nx = e.pageX - off | 0;
        if (nx < 0) {
          nx = 0
        } else if (nx > maxNum) {
          nx = maxNum;
        };
        nx = nx / chop | 0;
        spin.style.top = -nx * tweenTop + 'px';
        drag.style.left = nx * chop + 'px';
      });

    })();
  });


  ifclass('div.roomCMS', function (d) {
    d.each(function () {
      if ($(this).hasClass('roomCMST3')) {
        /*var maxH  = 0;
        $(this).find('.txt').each(function (j){
          if($(this).height() > maxH) maxH = $(this).height();
        }).css({height:maxH+'px'});*/
        var thisTxt = $(this).find('.txt');

        $(this).find('.each').eq(2).removeClass('left').addClass('right');

        function checkHeight() {
          if (win.d.width() < check.phone) {
            thisTxt.css({
              height: 'auto'
            });
          } else {
            thisTxt.fxSameHeight();
          }
        };
        checkHeight();
        var thisTimer;
        win.d.resize(function () {
          clearTimeout(thisTimer);
          thisTimer = setInterval(checkHeight, 500);
        });
      } else if ($(this).hasClass('roomCMST2')) {
        $(this).find('div.each').each(function (j) {
          if (j % 2 == 0) {
            $(this).addClass('left');
          } else {
            $(this).addClass('right');
          }
        });
        var thisTxt = $(this).find('div.txt');

        function checkHeight() {
          if (win.d.width() < check.phone) {
            thisTxt.css({
              height: 'auto'
            });
          } else {
            thisTxt.fxSameHeight();
          }
        }
        checkHeight();
        var thisTimer;
        win.d.resize(function () {
          clearTimeout(thisTimer);
          thisTimer = setInterval(checkHeight, 500);
        });
      }
    });
  });




  ifid('roomSpecTable', function (d) {
    var btn = $('#roomSpecTable div.head');
    var expand = $('#roomSpecTable div.head div.right a');
    var option = $('#roomSpecTab .f1');
    var optionD = $('#roomSpecTab .f2');
    var cont = $('#roomSpecTable div.table');
    var select = $('#roomSpecSelect > div');
    var selecti = 0;
    var data = {
      car: '',
      col: '價格',
      mode: '規格表',
      ser: '相關車款',
      diff: '無強相異處顯示'
    }

    var locate = window.location.href.toLowerCase();
    locate = locate.slice(locate.indexOf('/showroom/') + 10).replace('.aspx', '');

    var tab = $('#roomSpecTab .btn a');
    var tabi = 0;
    var tabCont = $(d).children('div');

    cont.hide();
    btn.each(function (i) {
      var txt = $(this).find('.left').text();
      $(this).bind(evt.click, function () {
        if ($(this).next().css('display') == 'none') {
          $(this).next().slideDown(300);
          expand.eq(i).addClass('ON');
          data.col.replace(txt, '');
          data.col += ' ' + txt;
          fga('/展示間/' + locate + '規格配備/' + txt);
          sga();
        } else {
          $(this).next().slideUp(300);
          expand.eq(i).removeClass('ON');
          data.col.replace(txt, '');
        }

      });

    }).eq(0).click();


    tabCont.hide().eq(0).show();
    select.hide().eq(0).show();

    tab.each(function (i) {
      var txt = $(this).text();
      $(this).bind(evt.click, function () {
        tabi = i;
        tabCont.hide().eq(i).fadeIn(500);
        tab.removeClass('ON').eq(i).addClass('ON');
        data.mode = txt;
        fga('/展示間/' + locate + '規格配備/' + txt);
        sga();
      });
    });
    option.each(function (i) {
      var txt = $(this).text();
      $(this).bind(evt.click, function () {
        selecti = i;
        select.hide().eq(i).fadeIn(500);
        option.removeClass('ON').eq(i).addClass('ON');
        data.ser = txt;
        fga('/展示間/' + locate + '規格配備/' + txt);
        sga();
      });
    });
    optionD.click(function () {
      setTimeout(function () {
        if (optionD.hasClass('ON')) {
          data.diff = '加強相異處顯示';
          fga('/展示間/' + locate + '規格配備/加強相異處顯示');
        } else {
          data.diff = '無強相異處顯示';
          fga('/展示間/' + locate + '規格配備/加強相異處顯示/取消');
        }
        sga();
      }, 33);

    });

    select.find('select').change(function () {
      getSelect();
      fga('/展示間/' + locate + $(this).find("option:selected").text());
      sga();
    });

    function getSelect() {
      data.car = '';
      select.eq(selecti).find('select').each(function () {
        data.car += $(this).find('option:selected').text() + '++';
      });
    }

    function sga() {
      getSelect()
      data.col = '';
      tabCont.eq(tabi).find('div.table:visible').each(function () {
        data.col += $(this).prev().find('div.left').text() + ' ';
      });
      data.s = data.mode + '/' + data.car + '/' + data.diff + '/' + data.col;
      fga('/展示間/SPEC/' + data.s);

      fga('_spec2', '[locate]' + locate + '/[spec]' + data.s + ((win.now && win.now.label) ? win.now.label : '') + win.clientId, win.clientId);

      /*fdmData='/[^datatype]visit'+fdmData+'/[userid]'+win.clientId+'/[^useridold]'+getCookie('fvlast');*/
      fdmData += '/[^spec]' + data.car + '/[^specimprove]' + data.diff + '/[^specrow]' + data.col + '/[^specmode]' + data.mode;
      if (fdmsend && typeof (fdmsend.send) == 'function') {
        fdmsend.send('/[^datatype]spec' + fdmData);
      };

    }

  });

  ifid('roomPaper', function (d) {
    var img = $(d).find('div.eachImg');
    var box = $(d).find('div.res >div');
    var btn = $(d).find('div.list a');
    img.hide().eq(0).show();
    box.hide().eq(0).show();
    btn.each(function (i) {
      $(this).bind(evt.click, function () {
        btn.removeClass('ON').eq(i).addClass('ON');
        box.hide().eq(i).fadeIn(300);
        img.hide().eq(i).fadeIn(300);
      });
    });
    var locate = window.location.href.toLowerCase();
    locate = locate.slice(locate.indexOf('/showroom/') + 10).replace('.aspx', '');
    box.find('a').each(function () {
      var txt = $(this).text();
      $(this).click(function () {
        fga('/展示間/' + locate + 'wallpaper/' + txt);
      });
    });

  });




  ifid('subMenu', function (d) {



    var iscr;
    $('#subMenuBox').bind(evt.click, function (e) {
      e.stopPropagation();
    });
    doc.bind(evt.click, function () {
      if (subOpen == 1) {
        subMenuClose();
      }
    });
    if ($.browser.msie && $.browser.version <= 8) {

    } else {
      if (!id('appuse')) {
        $.getScript('/js/iscroll.js', function (n1, rs, n3, n4) {
          if (rs == 'success') {
            iscr = new iScroll('subMenu', {
              hideScrollbar: true,
              fadeScrollbar: true
            });
            if (typeof (doneScroll) == 'function') doneScroll();
          }
        });
      }

    }


    //subMenuControl
    /*var scroll = new iScroll('subMenu',{
      hideScrollbar:true,
      fadeScrollbar:true
    });*/

    //var btn = $('menuCenter .btn');
    var btn = $('#getSubMenu');

    var subOpen = 0;
    var tweenMenu = $('#tweenMenu');
    var subMenuBox = $('#subMenuBox');
    var logo = $('#tweenMenu .logo')[0];

    var subWidth;
    var subP;
    var great;
    var isIndex = (id('indexBanner')) ? true : false;
    var menuFull = (id('brandBannerIndex') || id('indexBanner')) ? true : false;
    if (!menuFull) {
      if ($('#Menu')[0]) $('#Menu').find('div.menuPadding')[0].style.padding = '0';
    }
    var once = true;

    function subResize() {
      if (win.d.width() < 768) {
        subWidth = win.d.width() - 44;
        subP = 10;
        great = false;
      } else {
        /*if(win.d.width() < 989){
          subWidth = 400;
        } else {
          subWidth = 400;	
        }*/
        subWidth = 400;

        if (menuFull) {
          subP = 15;
        } else {
          subP = 0;
        }
        great = true;
      };
      d.style.width = subWidth + subP * 2 + 'px';
      if (isIndex) indexBannerOp.reset();
    }
    subResize();
    var subTimer;
    if (win.mobile) {
      id('subMenuControl').style.paddingRight = '30px';
    };


    btn.bind(evt.click, function (e) {

      e.stopPropagation();
      subOpen++;
      once = false;

      if (subOpen % 2 == 0) {
        //console.log("subMenuClose");
        subMenuClose();
      } else {
        //console.log("subMenuOpen");
        subMenuOpen();
      };
    });

    function subMenuOpen() {
      subOpen = 1;
      if (isIndex) indexBannerOp.stop();
      if (!great) logo.style.display = 'none';
      subMenuBox.stop().css({
        width: subP + 'px'
      }).animate({
        width: subWidth + ((great) ? subP : 0) + 'px'
      }, 500, function () {
        if (iscr) iscr.refresh();
      });
      tweenMenu.animate({
        marginRight: subWidth + 'px'
      }, 500);
      btn.addClass('ON');
      fga('/開主選單');
    };

    function subMenuClose() {
      subOpen = 0;
      if (isIndex) indexBannerOp.reset();
      if (!great) logo.style.display = 'none';
      tweenMenu.stop().animate({
        marginRight: '0px'
      }, 500);
      subMenuBox.stop().animate({
        width: subP + 'px'
      }, 500, function () {
        this.style.width = '0px';
        logo.style.display = 'block';
      });
      btn.removeClass('ON');
      fga('/關主選單');
    };

    function closeNow() {
      subOpen = 0;
      if (logo) logo.style.display = 'block';
      subOpen = 0;
      tweenMenu.stop();
      subMenuBox.stop();
      tweenMenu[0].style.marginRight = '0px';
      subMenuBox[0].style.width = '0px';
      btn.removeClass('ON');

    };
    subMenuBox.bind('clickoutside', subMenuClose);
    subMenuBox.unbind('clickoutside', subMenuClose);
    indexLoading = function () {
      subMenuOpen();
      setTimeout(function () {
        if (once) subMenuClose();
      }, 2000);
    }
    /*
        if(isIndex){
          subMenuOpen();
          win.d.load(function (){
            setTimeout(function (){
              if(once)subMenuClose();
            }, 2000);
          });
        } else {
          subOpen++;
        }*/

    win.d.resize(function () {
      if (isIndex) indexBannerOp.stop();
      closeNow();
      clearTimeout(subTimer);
      subTimer = setTimeout(subResize, 100);


    });


    ifid('roomMenu', function (f) {

      var f2 = id('roomMenu2');
      /*document.title = $(f).offset().top;*/
      var checkTop = 542 - 68;

      var winTop;
      var btn2 = $(f).find('.right a');
      var marker = new Array();
      var marker2 = new Array();
      var roomMarker = $('div.roomMarker');
      var roomFlipDom = $('div.roomFlipDom');
      var roomFlipBool = true;
      var mainMenu = id('Menu');
      var roomFlip = new Array();
      var thisTimer;
      var ocss = {
        bottom: $(f).css('bottom'),
        position: $(f).css('position')
      };
      var setBar;
      var runBar;
      var hideBar;
      var appuse = (id('appuse')) ? true : false;
      var rTab = $('div.roomExpandTab');
      var rBtn = $('div.roomExpandTab div.btn');
      var rBtn2 = $('#roomMenu2 > div');
      var rCont = $('div.roomExpandCont');
      var rData = new Array();
      var rContCMS = new Array();
      rCont.each(function (i) {
        rContCMS.push({
          c2: $('div.roomCMST2', this),
          c3: $('div.roomCMST3', this)
        });
      });
      var top2;
      rTab.each(function (i) {
        rData[i] = true;
      });

      function setTop2() {
        if (win.d.width() > 767) {
          top2 = 82;
        } else {
          top2 = 75;
        }
        if (win.d.width() > 989) {
          rCont.show();
        } else {
          rBtn2.hide();
          // rBtn2.click();
        }
      };
      setTop2();

      function bindTab() {
        rTab.bind('click', evtTab);
      };

      function unbindTab() {
        rTab.unbind('click', evtTab);
      };

      function evtTab(e, i) {
        var dex = rTab.index(this);
        if (rData[dex]) {
          rCont.removeClass('ON');
          rCont.hide();
          rBtn2.hide().eq(dex).show();
          rCont.eq(dex).fadeIn(300, function () {
            if (win.d.width() < 990 && win.d.width() > 360) {
              rContCMS[dex].c2.each(function () {
                $(this).find('.txt').fxSameHeight();
              });
              rContCMS[dex].c3.each(function () {
                $(this).find('.txt').fxSameHeight();
              });
            }
          });
          for (var y in rData) {
            rData[y] = true;
          }
          rData[dex] = false;
          rBtn.removeClass('ON');
          scrollBody.animate({
            scrollTop: rBtn.eq(dex).addClass('ON').offset().top - top2 + 'px'
          }, 500);
        } else {
          rBtn2.hide();
          rBtn.eq(dex).removeClass('ON');
          rCont.eq(dex).fadeOut(300);

          rData[dex] = true;
        };

      }
      // to-fix
      rBtn2.click(function () {
        rBtn2.hide();
        rBtn.removeClass('ON');
        rCont.hide();
        for (y in rData) {
          rData[y] = true;
        }
      });

      function resetWin() {
        roomMarker.each(function (i) {
          marker[i] = $(this).offset().top - 50;
          marker2[i] = $(this).offset().top - win.d.height() / 3;
          roomFlip[i] = {
            d: roomFlipDom.eq(i),
            b: true
          }
        });
        if (!appuse) marker[marker.length - 1] = doc.height() - win.d.height();
        ocss = {
          bottom: $(f).css('bottom'),
          position: $(f).css('position')
        };
      }

      function setTab() {
        if (win.d.width() >= 990) {
          unbindTab();
        } else {
          unbindTab();
          bindTab();
          if (roomFlipBool) {
            roomFlipDom.addClass('roomFlipIn');
            roomFlipBool = false;
          }
        };
        if (appuse) roomFlipDom.addClass('roomFlipIn');
      }
      setTab();

      win.d.load(resetWin);
      win.d.resize(function () {
        clearTimeout(thisTimer);
        thisTimer = setTimeout(function () {
          winScroll();
          setTab();
          setBar();
          setTop2();
          resetWin();
          winScroll();
        }, 510);
      });
      var locate = window.location.href.toLowerCase();
      locate = locate.slice(locate.indexOf('/showroom/') + 10).replace('.aspx', '');
      btn2.each(function (i) {
        var txt = $(this).text();
        $(this).bind(evt.click, function () {
          scrollBody.animate({
            scrollTop: marker[i] + 'px'
          }, aEase);
          fga('/展示間/' + locate + '腰帶/' + txt);
          return false;
        });
      });

      if (appuse) {
        f2.style.top = '0px';
      }

      function winScroll() {
        winTop = $(this).scrollTop();
        if (!appuse) marker[marker.length - 1] = doc.height() - win.d.height();
        if (win.d.width() >= 990) {
          if (winTop > checkTop) {
            f.style.position = 'fixed';
            f.style.bottom = 'auto';
            f.style.top = '0px';
            closeNow();
            mainMenu.style.display = 'none';
          } else {
            f.style.position = 'absolute';
            f.style.bottom = '0px';
            f.style.top = 'auto';
            mainMenu.style.display = 'block';

          };
        } else {
          mainMenu.style.display = 'block';
        }


        for (var i = marker.length - 1; i > -1; i--) {
          btn2.removeClass('ON');
          hideBar();
          if (marker2[i] - 1 <= winTop) {
            if (roomFlip[i].b) {
              roomFlip[i].d.addClass('roomFlipIn');
              roomFlip[i].b = false;
            }
          }
          if (marker[i] - 1 <= winTop) {
            btn2.eq(i).addClass('ON');
            runBar(i);
            /*if(roomFlip[i].b){
              roomFlip[i].d.addClass('roomFlipIn');
              roomFlip[i].b = false;
            }*/
            break;
          }

        }
      }

      win.d.scroll(winScroll);

      (function () {
        var bar = {
          d: $(f).find('.right div.bar'),
          dom: $(f).find('.right')
        };
        setBar = function () {
          bar.array = new Array();
          bar.left = bar.dom.offset().left;
          btn2.each(function (i) {
            bar.array[i] = {
              left: $(this).offset().left - bar.left,
              width: $(this).outerWidth()
            }
          });
        };
        runBar = function (n) {
          bar.d[0].style.left = bar.array[n].left + 'px';
          bar.d[0].style.width = bar.array[n].width + 'px';
        };
        hideBar = function () {
          bar.d[0].style.width = '0px';
        }

      })();
      setBar();

    });

  });

  /*ifid('kvBanner', function (d){
    var txt = $(d).find('div.txt')[0];
    //var ts = (getUrlVars()['id'])?true:false;
    var thisTop;
    win.d.scroll(function (){
      thisTop = $(this).scrollTop();
      d.style.backgroundSize = 'auto '+ (330+thisTop*0.5) +'px';
      txt.style.top = thisTop + 'px';
    });
  });*/

  // milkmidi 20160413

  ifid('kvBanner', function (d) {
    if (device.desktop()) {
      var txt = $(d).find('div.txt')[0];
      var thisTop;
      var kvheight = $(d).height();
      kvscroll(win.d);
      win.d.scroll(function () {
        kvscroll($(this));
      });

      function kvscroll(_this) {
        thisTop = _this.scrollTop();
        d.style.backgroundSize = 'auto ' + (kvheight + thisTop * 0.5) + 'px';
        if (txt) txt.style.top = thisTop + 'px';
      }
    } else {
      var txt = $(d).find('.title , .title2');
      txt.css('color', 'white');
    }
  });




  ifid('conceptPage', function (d) {
    $('body,html').css({
      height: '100%'
    });
    $('#Foot').appendTo(d);
    id('Box').style.height = "100%";

    function isCanvasSupported() {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    }

    function canvasLine() { /*canvas line*/
      w = $(window);
      var dot = new Array();
      var can = {
        w: w.width(),
        h: w.height(),
        t: null,
        i: 100,
        f: 33,
        r: 150
      }
      for (var i = 0; i < can.i; i++) {
        dot[i] = {
          x: ~~(Math.random() * can.w),
          y: ~~(Math.random() * can.h),
          a: Math.random(),
          c: (i % 2 == 0) ? 'rgba(180,180,180,0.3)' : 'rgba(0,0,0,0.3)'
        }
        dot[i].tx = dot[i].x;
        dot[i].ty = dot[i].y;
      };
      var c = id('canvas');
      var ctx = c.getContext('2d');
      var option = {
        lw: 0.2,
        lc: 'rgba(180,180,180,1)'
      }
      c.width = can.w;
      c.height = can.h;
      ctx.strokeStyle = option.lc;
      ctx.lineWidth = option.lw;
      /*ctx.globalCompositeOperation = "lighter";*/

      function wTime() {
        return setTimeout(function () {
          can.w = w.width();
          can.h = w.height();
          c.width = can.w;
          c.height = can.h;
          ctx.strokeStyle = option.lc;
          ctx.lineWidth = option.lw;
          drawStart();

        }, 500);
      }
      $(window).resize(function () {

        clearInterval(canvasTimer);
        clearTimeout(can.t);
        can.t = wTime();
      });

      function tween(nowN, toN) {
        return ((toN - nowN) * 0.01 + nowN);
      };
      var drawFace = 0;
      var canvasTimer;

      function drawStart() {
        canvasTimer = setInterval(function () {
          ctx.clearRect(0, 0, can.w, can.h);
          for (e in dot) {
            dot[e].x = tween(dot[e].x, dot[e].tx);
            dot[e].y = tween(dot[e].y, dot[e].ty);
            dot[e].relate = new Array();
          };

          for (e in dot) {
            var x, y, z;
            dot[e].relate = new Array();
            for (j in dot) {
              if (e != j) {
                x = Math.pow((dot[j].x - dot[e].x), 2);
                y = Math.pow((dot[j].y - dot[e].y), 2);
                z = Math.sqrt((x + y));
                var grad;
                if (z < can.r) {
                  dot[e].relate.push(dot[j]);
                  ctx.beginPath();
                  ctx.moveTo(dot[e].x, dot[e].y);
                  ctx.lineTo(dot[j].x, dot[j].y);
                  ctx.stroke();
                };
                x = y = z = grad = null;
              }
            }
          };
          for (e in dot) {

            if (dot[e].relate.length > 1 && dot[e].face) {

              ctx.beginPath();
              ctx.moveTo(dot[e].x, dot[e].y);
              ctx.lineTo(dot[e].relate[0].x, dot[e].relate[0].y);
              ctx.lineTo(dot[e].relate[1].x, dot[e].relate[1].y);

              var maxX = Math.max(dot[e].x, dot[e].relate[0].x, dot[e].relate[1].x);
              var minX = Math.max(dot[e].x, dot[e].relate[0].x, dot[e].relate[1].x);
              var maxY = Math.max(dot[e].y, dot[e].relate[0].y, dot[e].relate[1].y);
              var minY = Math.max(dot[e].y, dot[e].relate[0].y, dot[e].relate[1].y);
              var cX = (dot[e].x + dot[e].relate[0].x + dot[e].relate[1].x) / 3;
              var cY = (dot[e].y + dot[e].relate[0].y + dot[e].relate[1].y) / 3;
              //ctx.fillStyle='rgba(255,255,255,0.1)';
              ctx.fillStyle = dot[e].c;
              ctx.fill();
              ctx.closePath();
              grd = maxX = minX = maxY = minY = cX = cY = null;
            }
          }



        }, can.f);
      };

      if (isCanvasSupported()) {
        drawStart();
      }


      var rand = Math.round(can.w / 3);
      var rand2 = rand / 2;
      var loop1 = 1500;

      setInterval(function () {
        ctx.clearRect(0, 0, can.w, can.h);
        for (e in dot) {
          if (++drawFace % 5 == 0) {
            dot[e].face = true;
          } else {
            dot[e].face = false;
          }
          dot[e].tx = dot[e].x + Math.round(Math.random() * rand) - rand2;
          dot[e].ty = dot[e].y + Math.round(Math.random() * rand) - rand2;
          if (dot[e].tx < -30) {
            dot[e].tx = -dot[e].tx;
          } else if (dot[e].tx > can.w + 30) {
            dot[e].tx = can.w - (dot[e].tx % can.w);
          }
          if (dot[e].ty < -30) {
            dot[e].ty = -dot[e].ty;
          } else if (dot[e].ty > can.h + 30) {
            dot[e].ty = can.h - (dot[e].ty % can.h);
          }
          /*dot[e].tx = Math.random()*can.w;
          dot[e].ty = Math.random()*can.h;*/
        };
      }, 5000);
      ctx.clearRect(0, 0, can.w, can.h);
      for (e in dot) {
        if (++drawFace % 3 == 0) {
          dot[e].face = true;
        } else {
          dot[e].face = false;
        }
        dot[e].tx = dot[e].x + Math.round(Math.random() * rand) - rand2;
        dot[e].ty = dot[e].y + Math.round(Math.random() * rand) - rand2;
        /*dot[e].tx = Math.random()*can.w;
        dot[e].ty = Math.random()*can.h;*/
      };


    }; //canvasLine end
    //canvasLine();

    if (win.mobile) {

      if (win.d.height() < 500) {
        id('Box').style.height = '500px';
      }
      if (id('canvas') && win.d.width() > 640) {
        canvasLine();
      } else {
        $('#conceptPage').addClass('conceptAddBG').find('div.canvas').remove();
      }

    } else if (id('canvas')) {
      if (isCanvasSupported()) {
        canvasLine();
      } else {
        $('#canvas').remove();
        $(d).addClass('conceptAddBG');
      }
    }

    (function () { /*conceptList*/
      var t = $('#conceptList');
      var aItem = t.find('div.aItem');
      var each = aItem.children('div');
      var cont = $('#conceptBG div.each');
      var aItem2 = $('#conceptBG div.aItem');
      var eachImg2 = $('#conceptBG div.each img');
      var each2 = $('#conceptBG div.each');
      var hasClass = false;
      var range;
      var aItemWidth = each.length * each.eq(0).outerWidth(true);
      var bar = {
        d: $('#conceptListBar'),
        p: $('#conceptListBar div.panel'),
        s: $('#conceptListBar div.bar'),
        id: 0
      }
      bar.dis = bar.p.width() - bar.s.width();
      var wTimer;
      aItem[0].style.width = aItemWidth + 'px';

      function reWidth() {
        aItemWidth = each.length * each.eq(0).outerWidth(true);
        aItem[0].style.width = aItemWidth + 'px';
        range = aItemWidth - win.d.width();
        if (range <= 0) {
          bar.d.hide();
        } else {
          bar.d.show();
        };
        aItem[0].style.left = "0px";
        bar.d[0].style.left = "0px";
        bar.l = bar.p.offset().left;
        bar.r = bar.l + bar.p.width() - bar.s.width();

      };
      reWidth();

      if (win.ie && win.iev <= 8) {
        (function () {
          var wTimer;
          var wh;
          eachImg2.show();

          each2.css({
            backgroundImage: 'none'
          });
          win.d.resize(function () {
            clearTimeout(wTimer);
            wTimer = setTimeout(wResize, 500);
          });

          function wResize() {
            wh = win.d.height();
            ih = eachImg2.eq(0).height();
            eachImg2.each(function () {
              this.style.marginTop = (wh - ih) / 2 + 'px';
            });
          };
          win.d.load(wResize);
        })();
      }

      function setLeft(e) {
        bar.x = e - 32;
        if (bar.x < bar.l) {
          bar.s[0].style.left = '0px';
          bar.x = 0;
        } else if (bar.x > bar.r) {
          bar.s[0].style.left = bar.dis + 'px';
          bar.x = bar.dis;
        } else {
          bar.s[0].style.left = bar.x - bar.l + 'px';
          bar.x = bar.x - bar.l;
        };
        bar.per = bar.x / bar.dis;
        aItem[0].style.left = ~~(-range * bar.per) + 'px';
      }
      if (win.mobile) {
        bar.d[0].addEventListener('touchmove', function (e) {
          e.preventDefault();
          setLeft(e.touches[0].pageX);
          return false;
        }, false);
      } else {
        bar.d.mousemove(function (e) {
          setLeft(e.pageX);
        });
        each.each(function (i) {
          $(this).hover(function () {
            each2.eq(i).addClass('eachON');
          }, function () {
            each2.eq(i).removeClass('eachON');
          });
        });
      };
      /*each.each(function (i){
        $('a',this).bind(evt.click,function (){
          //carBox.style.bottom='0%';
          carBox.addClass('conceptCarON');
        });
      });*/


      win.d.resize(function () {
        bar.d.hide();
        clearTimeout(wTimer);
        wTimer = setTimeout(function () {
          reWidth();
        }, 500);
      });

      var carBox = $('#conceptCar');
      $('#conceptCar>div').each(function () {
        slide100($(this), {
          click: evt.click
        });
        var open = false;
        var cont = $('div.txt', this);
        var btn = $('div.btn a', this).bind(evt.click, function () {
          if (open) {
            open = false;
            cont.slideUp(300);
            btn.removeClass('ON');
          } else {
            open = true;
            cont.slideDown(300);
            btn.addClass('ON');
          }
        });
        $('a.close', this).bind(evt.click, function () {
          carBox.removeClass('conceptCarON');
        })
      });

    })();


  });


  ifid('conceptPage2', function (d) {
    $('body,html').css({
      height: '100%'
    });
    $('#Foot').appendTo(d);
    id('Box').style.height = "100%";

    var carBox = id('conceptCar');
    $('#conceptCar>div').each(function () {
      slide100($(this), evt.click, 'v', 'conceptPage2');
      var open = false;
      var cont = $('div.txt', this);
      var btn = $('div.btn a', this).bind(evt.click, function () {
        if (open) {
          open = false;
          cont.slideUp(300);
          btn.removeClass('ON');
        } else {
          open = true;
          cont.slideDown(300);
          btn.addClass('ON');
        }
      });
      if (win.mobile && win.d.width() < 400) {

      } else {
        btn.click();
        setTimeout(function () {
          if (open) {
            btn.click();
          }
        }, 3000);
      }

      $('a.close', this).bind(evt.click, function () {
        carBox.style.bottom = '-100%';
      })
    });
  });

  ifid('ownerTab', function (d) {
    var btn = $(d).find('div.ownerTab a');
    var cont = $(d).find('div.ownerCont>div');
    cont.hide().eq(0).show();
    btn.each(function (i) {
      $(this).bind(evt.click, function () {
        btn.removeClass('ON').eq(i).addClass('ON');
        cont.hide().eq(i).fadeIn(500);
      });
    });
  });

  ifclass('.tvcPop', function (d) {
    d.each(function () {
      var href = this.getAttribute('video');
      $(this).click(function () {
        vf.popVideo(null, {
          w: '100%',
          h: (win.mobile && win.d.width() < 768) ? '300' : '100%',
          l: href
        });
        fga('/看TVC/' + href);
      });

    });
    var vf = {};
    (function () {
      var nowVideo;
      var readyEvt;
      var stateEvt;
      var isMobile;
      var data = {
        play: null,
        close: null,
        now: null,
        bar: null,
        video: null,
        pNow: 0,
        pFull: 0,
        timer: null
      }
      vf.set = function (d) {
        data.play = d.find('.play a');
        data.close = d.find('.close a');
        data.now = d.find('.now');
        data.full = d.find('.full');
        data.video = d.find('.video');
        data.timeline = d.find('.timeLine');
        data.bar = d.find('.bar')[0];
        data.control = d.find('.control');
        data.close.click(vf.closeVideo);
        data.dom = d[0];
        if (win.d.width() < 768) {
          d.find('.control').hide();
          d.find('.control2').show();
        };
        win.d.resize(function () {
          clearTimeout(data.timer);
          data.timer = setTimeout(function () {
            data.video[0].style.height = win.d.height() - 41 + 'px';
          }, 500);
        });
      };
      var bd = $('#BG,#DOT');

      vf.popVideo = function (d, o) {
        if (nowVideo) {
          nowVideo.destroy();
        };
        bd.show();
        data.dom.style.height = win.d.height() + 'px';
        if (win.tablet && win.ios) {
          data.control.hide();
          data.video[0].style.height = win.d.height() - 20 - 41 + 'px';
        } else {
          data.video[0].style.height = win.d.height() - 41 + 'px';
        }

        data.videoId = 'vfTempDOMcreated';
        data.video.html('<div id="' + data.videoId + '"></div>');
        data.playNow = false;
        nowVideo = new YT.Player(data.videoId, {
          height: o.h,
          width: o.w,
          videoId: o.l,
          playerVars: {
            'autoplay': 1,
            'controls': 0,
            'rel': 0,
            'wmode': 'opaque',
            'showinfo': 1,
            'modestbranding': 0
          }
        });
        if (isMobile) {

        } else {
          data.playNow = true;
          nowVideo.addEventListener('onReady', readyEvt);
          nowVideo.addEventListener('onStateChange', stateEvt);
        }

      };

      function playBtn() {
        if (data.playNow) {
          data.play.removeClass('ON');
          nowVideo.pauseVideo();
          data.playNow = false;
        } else {
          data.play.addClass('ON');
          nowVideo.playVideo();
          data.playNow = true;
          runVideo();
        }
      }
      readyEvt = function () {

        data.play.addClass('ON').bind('click', playBtn);
        data.left =
          data.timeline.click(function (e) {
            data.go = (e.pageX - data.left) / $(this).width() * data.pFull;
            nowVideo.seekTo(data.go, true);
            nowVideo.playVideo();
          }).offset().left;

        data.pFull = nowVideo.getDuration();
        data.full.html(az(Math.floor(data.pFull / 60)) + ':' + az(data.pFull % 60));

      };
      stateEvt = function (ev) {

        switch (ev.data) {
          case 0:
            clearInterval(data.timer);
            data.bar.style.width = '100%';
            break;
          case 1:
            data.play.addClass('ON');
            nowVideo.playVideo();
            data.playNow = true;
            runVideo();
            break;
          case 2:
            clearInterval(data.timer);
            data.play.removeClass('ON');
            nowVideo.pauseVideo();
            data.playNow = false;
            break;
          case 3:
            break;
          case 4:
            break;
        }
      };

      function runVideo() {
        clearInterval(data.timer);
        data.timer = setInterval(function () {
          if (win.tablet) {
            data.control.show();
          }
          data.pNow = nowVideo.getCurrentTime();
          data.now.html(az(Math.floor(data.pNow / 60)) + ':' + az(~~(data.pNow) % 60));
          data.bar.style.width = data.pNow / data.pFull * 100 + '%';
        }, 33);
      }
      vf.closeVideo = function () {
        if (nowVideo) {
          data.play.unbind('click', playBtn);
          clearInterval(data.timer);
          nowVideo.removeEventListener('onReady', readyEvt);
          nowVideo.removeEventListener('onStateChange', stateEvt);
          nowVideo.destroy();
          nowVideo = null;
          data.bar.style.width = '0%';
          data.play.removeClass('ON');
          data.now.html('--:--');
          data.full.html('--:--');
        };
        bd.hide();

      };
      var zs;

      function az(num) {
        zs = 2 - num.toString().length + 1;
        return Array(+(zs > 0 && zs)).join("0") + num;
      }
    })();
    if (id('videoPop')) vf.set($('#videoPop'));

  });

  ifid('oeFilter', function (d) {

    //autoWidth with minWidth
    var info = {
      minWidth: null,
      autoWidth: false,
      checkWidth: $('#oeFilterCont > div').eq(0).outerWidth(true),
      box: $('#oeFilterCont'),
      padding: 10,
      center: false,
      select: new Array(0, 0),
      respWidth: 990
    };
    var dom = {
      all: $('#oeFilterCont > div')
    };
    dom.save = dom.all;

    function sortH(a, b) {
      return ((b.h < a.h) ? -1 : ((b.h > a.h) ? 1 : 0));
    }

    function sortS(a, b) {
      return ((a.y < b.y) ? -1 : ((a.y > b.y) ? 1 : 0));
    }

    function sortS2(a, b) {
      return ((a.z < b.z) ? -1 : ((a.z > b.z) ? 1 : 0));
    }

    function runLayout(obj) {

      if (win.d.width() > 767) {
        info.hasWidth = info.box.width();
        info.addWidth = 0;
        info.yArray = new Array();
        info.maxHeight = 0;
        if (info.autoWidth) {
          //autowidth
        } else {
          info.pX = info.checkWidth + info.padding;
          info.chop = ~~(info.hasWidth / info.pX);
          for (var i = 0; i < info.chop; i++) {
            if (i % 2 == 1) {
              info.yArray[i] = info.padding * 2;
            } else {
              info.yArray[i] = 0;
            }

          };
        };

        obj.each(function (i) {
          info.pow = i % info.chop;
          this.style.left = info.pow * info.pX + info.padding / 2 + 'px';
          this.style.top = info.yArray[info.pow] + 'px';
          info.yArray[info.pow] += $(this).height() + info.padding;
          if (info.yArray[info.pow] > info.maxHeight) {
            info.maxHeight = info.yArray[info.pow];
          }
        });
        info.box[0].style.height = info.maxHeight + 'px';
      } else {
        info.box[0].style.height = 'auto';
      }


    };
    runLayout(dom.all);

    var filterBtn = $('#oeFilter select');

    function objFilter() {
      dom.save = info.box.children('div.f' + info.select[0] + '.s' + info.select[1]);
    }
    /*filterBtn.each(function (i){
      $(this).change(function (){
        alert($(this).val());
        info.select[i] = $(this).val();
        dom.all.hide();
        dom.save = info.box.children('div.f'+info.select[0]+'.s'+info.select[1]).show();
        runLayout(dom.save);				
      });
    });*/

    /*filterBtn.each(function (i){
      $(this).click(function (){
        filterBtn.removeClass('ON').eq(i).addClass('ON');
        nowNum = i;
        newsInit(i);
      });
    });*/

    var sDelay;

    win.d.resize(function () {
      clearTimeout(sDelay);
      sDelay = setTimeout(function () {
        runLayout(dom.save);
      }, 300)
    });
    if (dom.all.find('.img img').length > 0) {
      $('#preloader').fxImgLoader({
        imgDOM: dom.all.find('.img img'),
        onFinish: function () {
          runLayout(dom.all);
        }
      });
    } else {
      runLayout(dom.all);
    }






  });


  ifclass('input.setDefault', function (d) {
    var setInput = d;
    if (setInput.length > 0) {
      setTimeout(function () {

        setInput.each(function () {
          var defaultVal = $(this).attr('defaultval');
          if (defaultVal) {
            $(this).focus(function () {
              if ($(this).val() == defaultVal) {
                $(this).val('');
              };
              $(this).removeClass('blur');
            }).blur(function () {
              if ($(this).val() == '' || $(this).val() == ' ') {
                $(this).val(defaultVal);
              };
              $(this).addClass('blur');
            });
            $(this).trigger('blur');
          }

        });

      }, 1000)
    };
  });

  ifclass('a.fb', function (d) {
    d.bind(evt.click, function () {
      var href = this.getAttribute('href');
      if (href == 'javascript:;') {
        window.open("http://www.facebook.com/sharer.php?u=" + window.location.href, "_blank");
        fga('/fbshare/' + window.location.href);
      } else {
        window.open("http://www.facebook.com/sharer.php?u=" + href, "_blank");
        fga('/fbshare/' + href);
      };
      href = null;
      return false;
    });
  });

  ifid('openApp1', function (d) {
    var btn = $('#openApp1, #openapp2');
    if (win.ios) {
      btn.attr('href', 'https://itunes.apple.com/tw/app/lexus-plus/id626100497?l=zh&mt=8').attr('target', '_blank').click(function () {
        fga('/lexusplus/ios');
      });
    } else if (win.android) {
      btn.attr('href', 'https://play.google.com/store/apps/details?id=com.hotaimotor.lexusplus').attr('target', '_blank').click(function () {
        fga('/lexusplus/android');
      });
    } else {
      btn.attr('href', 'http://www.lexus.com.tw/app/lexusplus/').attr('target', '_blank').click(function () {
        fga('/lexusplus/windows');
      });
    }
  });

  function fixCollectFilter() {
    // 改依照 data-type 做篩選, 但原來寫得太死了, 只好硬改 collectGrid each 的 class... T^T
    var types = [], $items, frClass, toClass;
    $('#collectFilter a').each(function(index) {
      var type = $(this).attr('data-type');
      types.push(type);
      // $(this).attr('data-type', 'f' + (index - 1));
      $items = $('.collectListGrid .each.' + type).addClass('org-' + type);
      $items.removeClass(type);
    });
    for (var i = 0; i < types.length; i++) {
      frClass = 'org-' + types[i];
      toClass = 'f' + i;
      $items = $('.collectListGrid .each.' + frClass).addClass(toClass);
    }
  }

  // ifid('collectListGrid', function (d) {
  //   $('.collectListGrid .each a').each(function () {
  //     $(this).attr('data-url', $(this).attr('href'));
  //   });

  //   fixCollectFilter();

  //   var c = $('#collectFilter');
  //   var btn = c.find('a');
  //   var grid = $(d).fxGrid(null, 500, btn.length, 'collectListGrid');
  //   var iOn;
  //   btn.each(function (i) {
  //     var txt = $(this).text();
  //     $(this).bind(evt.click, function () {
  //       var type = $(this).attr('data-type');
  //       btn.fxClass(i, 'ON');
  //       grid.runPos(i);

  //       if (i == 1) {
  //         $('.collectListGrid .each a').each(function () {
  //           $(this).attr('href', $(this).attr('data-url') + '&new=y');
  //         });
  //       } else {
  //         $('.collectListGrid .each a').each(function () {
  //           $(this).attr('href', $(this).attr('data-url'));
  //         });
  //       }

  //       // display collectFilterDesc
  //       $('.collectFilterDesc span').hide();
  //       $('.collectFilterDesc span[data-type=' + type + ']').css('display', 'inline-block');

  //       fga('/精品藝廊/' + txt);
  //     });
  //     if ($(this).hasClass('ON')) {
  //       iOn = i;
  //     }
  //   });
  //   btn.eq(iOn).trigger(evt.click);
  //   //grid.runPos(1);
  //   // if (win.phone) {
  //   if (device.mobile) {
  //     var p = c.parent().find('.collectFilterDesc')[0];
  //     var h = c.height();
  //     var s = c.offset().top;
  //     win.d.scroll(function () {
  //       if ($(this).scrollTop() - s > 90) {
  //         c[0].className = 'btn fixTab';
  //         p.style.marginTop = h + 'px';
  //       } else {
  //         c[0].className = 'btn';
  //         p.style.marginTop = '';
  //       };
  //     });
  //   };
  //   $('#selpri').change(function () {
  //     fga('/精品藝廊/篩選/' + $(this).find("option:selected").text());
  //   });
  // });



  ifid('brandBannerIndex', function (d) {
    if (win.ipad) {
      var imgs = $('#brandList').find('.w1 .txt3 img');
      var imgsTimer;

      function padResize() {
        if (win.d.width() > 989) {
          imgs.css({
            width: '1.5%'
          });
        } else {
          imgs.css({
            width: '1%'
          });
        }
      }
      padResize();
      win.d.resize(function () {
        clearTimeout(padResize);
        padResize = setTimeout(padResize, 500);
      });
    }
    var dom = d;
    var wTimer;
    var wid;

    function winResize() {
      wid = win.d.width();
      if (wid < 768) {
        d.style.height = '400px';
      } else {
        if (win.tablet) {
          d.style.height = win.d.height() - 35 + 'px';
        } else {
          d.style.height = win.d.height() - 15 + 'px';
        }

      }

    }
    win.d.resize(function () {
      clearTimeout(wTimer);
      wTimer = setTimeout(winResize, 500);
    });
    winResize();
  });

  ifid('kvBrandVideo', function (d) {
    if (!!document.createElement('video').canPlayType) {
      /*d.addEventListener('loadeddata', function() {
        d.play();
      }, false);
      d.addEventListener('canplay', function() {
        d.play();
      }, false);*/
      if (!win.phone) {
        d.addEventListener('canplaythrough', function () {
          $(d).parent()[0].style.visibility = 'visible';
          d.play();
        }, false);
        if (win.mobile) {
          window.addEventListener('touchstart', tStart, false);

          function tStart() {
            window.removeEventListener('touchstart', tStart);
            $(d).parent()[0].style.visibility = 'visible';
            d.play();
          }
        }
      } else {
        $(d).parent().remove();
      }

    }

  });

  ifid('brandTab', function (d) {
    var btn = $('#brandTab span.each:not(.link-to-takumi)');
    var cont = $('#brandCont > div');
    cont.hide().eq(0).show();
    var locate = window.location.href.toLowerCase();
    locate = locate.slice(locate.indexOf('brand-') + 6).replace('.aspx', '');
    btn.each(function (i) {
      var txt = $('.txt', this).text();
      $(this).bind(evt.click, function () {
        scrollBody.animate({
          scrollTop: $(this).offset().top - 51 + 'px'
        }, 300);
        btn.fxClass(i, 'ON');
        cont.hide().eq(i).fadeIn(500);
        fga('/品牌內涵/' + locate + '/' + txt);
      })

    });
  });

  ifid('kvBrand9', function (d) {
    var wTimer;
    var f = $('#Foot');
    var wid;
    var minH = 720;
    win.d.resize(function () {
      clearTimeout(wTimer);
      wtimer = setTimeout(wSize, 500);
    });

    function wSize() {
      wid = win.d.width();
      hei = win.d.height();

      if (wid < 990) {
        d.style.height = 'auto';
      } else if (hei < minH + f.outerHeight(true)) {
        d.style.height = minH + 'px';
      } else {
        d.style.height = hei - f.outerHeight(true) + 'px';
      }
    };
    wSize();
  });

  ifid('collectProductImg', function (d) {
    var btn = $(d).find('.list a');
    var cont = $(d).find('.img a');
    cont.hide().eq(0).show();
    btn.each(function (i) {
      $(this).bind(evt.click, function () {
        btn.fxClass(i, 'ON');
        cont.hide().eq(i).fadeIn(500);
      });
    });
    cont.lightBox();
  });

  ifid('brandList', function (d) {
    var btn = $(d).find('a.nc');
    btn.each(function () {
      var title2 = $(this).find('span.title2');
      var txt = DOMPurify.sanitize(title2.text());
      title2 = title2[0];
      $(this).hover(function () {
        title2.innerHTML = 'COMING SOON';
      }, function () {
        title2.innerHTML = DOMPurify.sanitize(txt);
      });
    });


  });


  if (win.mobile) {
    $(window).load(function () {
      if (win.box.height() < win.d.height()) {
        if ($('#Foot') && $('#Foot').length > 0) {
          $('#Foot')[0].style.marginTop = win.d.height() - win.box.height() + 'px';
        }
      }
    });
  }

  ifid('leftmenu', function (d) {
    $('body').append('<div class="rotatePlz"><div class="dot"><div class="txt">為保持最佳瀏覽經驗，請轉成橫式閱讀</div></div></div>');
  });

  ifid('gaLink1', function (d) {
    $(d).click(function () {
      fga('/NEWS/相關檔案下載/' + this.getAttribute('href'));
    });
  });
  ifid('gaLink2', function (d) {
    $(d).click(function () {
      fga('/LEXUS Global');
    });
  });
  ifid('gaLink3', function (d) {
    $(d).click(function () {
      fga('/LEXUS Facebook');
    });
  });
  ifid('gaLink4', function (d) {
    $(d).click(function () {
      fga('/LEXUS Youtube');
    });
  });
  ifid('gaLink5', function (d) {
    $(d).click(function () {
      fga('/認證中古車');
    });
  });
  ifid('gaLink6', function (d) {
    $(d).click(function () {
      fga('/高爾夫球院');
    });
  });
  ifid('gaLink7', function (d) {
    $(d).click(function () {
      fga('/LEXUS plus');
    });
  });

  ifid('newsDetailPage', function (d) {
    $(d).find('a').each(function () {
      var txt = $(this).text();
      $(this).click(function () {
        fga('/功能/' + txt);
      });
    });
  });

  ifid('brandList2', function (d) {
    $(d).find('.each a').each(function () {
      var txt = $(this).text();
      $(this).click(function () {
        fga('/AMAZING IN MOTION/' + txt);
      });
    });
  });

  ifid('map_canvas', function (d) {

    $('#class1').parent().find('a').each(function (i) {
      var txt = $(this).text();
      $(this).click(function () {
        fga('/據點查詢/' + txt);
      });
      if (i == 0) {
        fga('/據點查詢/' + txt);
      }
    });
    $('#city').change(function () {
      fga('/據點查詢/' + $(this).find("option:selected").text());
    });
  });


  ifid('collectQA', function (d) {
    var dom = $(d);
    var btn = dom.find('div.q a');
    var cont = dom.find('div.a');
    btn.each(function (i) {
      $(this).click(function () {
        if (cont.eq(i).css('display') == 'none') {
          cont.eq(i).fadeIn(300);
          $(this).addClass('ON');
        } else {
          cont.eq(i).fadeOut(300);
          $(this).removeClass('ON');
        }
      });

    });
  });

  ifid('contentsarea', function (d) {
    $('body').removeClass('pageBody').addClass('brandInt');
  });


});