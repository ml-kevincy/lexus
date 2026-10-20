/**
 * jQuery lightBox plugin
 * This jQuery plugin was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * @name jquery-lightbox-0.5.js
 * @author Leandro Vieira Pinho - http://leandrovieira.com
 * @version 0.5
 * @date April 11, 2008
 * @category jQuery plugin
 * @copyright (c) 2008 Leandro Vieira Pinho (leandrovieira.com)
 * @license CC Attribution-No Derivative Works 2.5 Brazil - http://creativecommons.org/licenses/by-nd/2.5/br/deed.en_US
 * @example Visit http://leandrovieira.com/projects/jquery/lightbox/ for more informations about this jQuery plugin
 */
/********************* jq lightbox************************************/
(function($){$.fn.lightBox=function(settings){settings=jQuery.extend({overlayBgColor:'#000',overlayOpacity:0.8,fixedNavigation:false,imageLoading:'images/lightbox-ico-loading.gif',imageBtnPrev:'images/lightbox-btn-prev.gif',imageBtnNext:'images/lightbox-btn-next.gif',imageBtnClose:'images/lightbox-btn-close.gif',imageBlank:'images/lightbox-blank.gif',containerBorderSize:10,containerResizeSpeed:400,txtImage:'Image',txtOf:'of',keyToClose:'c',keyToPrev:'p',keyToNext:'n',imageArray:[],activeImage:0},settings);var jQueryMatchedObj=this;function _initialize(){_start(this,jQueryMatchedObj);return false;}
function _start(objClicked,jQueryMatchedObj){$('embed, object, select').css({'visibility':'hidden'});_set_interface();settings.imageArray.length=0;settings.activeImage=0;if(jQueryMatchedObj.length==1){settings.imageArray.push(new Array(objClicked.getAttribute('href'),objClicked.getAttribute('title')));}else{for(var i=0;i<jQueryMatchedObj.length;i++){settings.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute('href'),jQueryMatchedObj[i].getAttribute('title')));}}
while(settings.imageArray[settings.activeImage][0]!=objClicked.getAttribute('href')){settings.activeImage++;}
_set_image_to_view();}
function _set_interface(){$('body').append('<div id="jquery-overlay"></div><div id="jquery-lightbox"><div id="lightbox-container-image-box"><div id="lightbox-container-image"><img id="lightbox-image"><div style="" id="lightbox-nav"><a href="#" id="lightbox-nav-btnPrev"></a><a href="#" id="lightbox-nav-btnNext"></a></div><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"><img src="'+settings.imageLoading+'"></a></div></div></div><div id="lightbox-container-image-data-box"><div id="lightbox-container-image-data"><div id="lightbox-image-details"><span id="lightbox-image-details-caption"></span><span id="lightbox-image-details-currentNumber"></span></div><div id="lightbox-secNav"><a href="#" id="lightbox-secNav-btnClose"><img src="'+settings.imageBtnClose+'"></a></div></div></div></div>');var arrPageSizes=___getPageSize();$('#jquery-overlay').css({backgroundColor:settings.overlayBgColor,opacity:settings.overlayOpacity,width:arrPageSizes[0],height:arrPageSizes[1]}).fadeIn();var arrPageScroll=___getPageScroll();$('#jquery-lightbox').css({top:arrPageScroll[1]+(arrPageSizes[3]/10),left:arrPageScroll[0]}).show();$('#jquery-overlay,#jquery-lightbox').click(function(){_finish();});$('#lightbox-loading-link,#lightbox-secNav-btnClose').click(function(){_finish();return false;});$(window).resize(function(){var arrPageSizes=___getPageSize();$('#jquery-overlay').css({width:arrPageSizes[0],height:arrPageSizes[1]});var arrPageScroll=___getPageScroll();$('#jquery-lightbox').css({top:arrPageScroll[1]+(arrPageSizes[3]/10),left:arrPageScroll[0]});});}
function _set_image_to_view(){$('#lightbox-loading').show();if(settings.fixedNavigation){$('#lightbox-image,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();}else{$('#lightbox-image,#lightbox-nav,#lightbox-nav-btnPrev,#lightbox-nav-btnNext,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();}
var objImagePreloader=new Image();objImagePreloader.onload=function(){$('#lightbox-image').attr('src',settings.imageArray[settings.activeImage][0]);_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);objImagePreloader.onload=function(){};};objImagePreloader.src=settings.imageArray[settings.activeImage][0];};function _resize_container_image_box(intImageWidth,intImageHeight){var intCurrentWidth=$('#lightbox-container-image-box').width();var intCurrentHeight=$('#lightbox-container-image-box').height();var intWidth=(intImageWidth+(settings.containerBorderSize*2));var intHeight=(intImageHeight+(settings.containerBorderSize*2));var intDiffW=intCurrentWidth-intWidth;var intDiffH=intCurrentHeight-intHeight;$('#lightbox-container-image-box').animate({width:intWidth,height:intHeight},settings.containerResizeSpeed,function(){_show_image();});if((intDiffW==0)&&(intDiffH==0)){if($.browser.msie){___pause(250);}else{___pause(100);}}
$('#lightbox-container-image-data-box').css({width:intImageWidth});$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({height:intImageHeight+(settings.containerBorderSize*2)});};function _show_image(){$('#lightbox-loading').hide();$('#lightbox-image').fadeIn(function(){_show_image_data();_set_navigation();});_preload_neighbor_images();};function _show_image_data(){$('#lightbox-container-image-data-box').slideDown('fast');$('#lightbox-image-details-caption').hide();if(settings.imageArray[settings.activeImage][1]){$('#lightbox-image-details-caption').html(settings.imageArray[settings.activeImage][1]).show();}
if(settings.imageArray.length>1){$('#lightbox-image-details-currentNumber').html(settings.txtImage+' '+(settings.activeImage+1)+' '+settings.txtOf+' '+settings.imageArray.length).show();}}
function _set_navigation(){$('#lightbox-nav').show();$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({'background':'transparent url('+settings.imageBlank+') no-repeat'});if(settings.activeImage!=0){if(settings.fixedNavigation){$('#lightbox-nav-btnPrev').css({'background':'url('+settings.imageBtnPrev+') left 15% no-repeat'}).unbind().bind('click',function(){settings.activeImage=settings.activeImage-1;_set_image_to_view();return false;});}else{$('#lightbox-nav-btnPrev').unbind().hover(function(){$(this).css({'background':'url('+settings.imageBtnPrev+') left 15% no-repeat'});},function(){$(this).css({'background':'transparent url('+settings.imageBlank+') no-repeat'});}).show().bind('click',function(){settings.activeImage=settings.activeImage-1;_set_image_to_view();return false;});}}
if(settings.activeImage!=(settings.imageArray.length-1)){if(settings.fixedNavigation){$('#lightbox-nav-btnNext').css({'background':'url('+settings.imageBtnNext+') right 15% no-repeat'}).unbind().bind('click',function(){settings.activeImage=settings.activeImage+1;_set_image_to_view();return false;});}else{$('#lightbox-nav-btnNext').unbind().hover(function(){$(this).css({'background':'url('+settings.imageBtnNext+') right 15% no-repeat'});},function(){$(this).css({'background':'transparent url('+settings.imageBlank+') no-repeat'});}).show().bind('click',function(){settings.activeImage=settings.activeImage+1;_set_image_to_view();return false;});}}
_enable_keyboard_navigation();}
function _enable_keyboard_navigation(){$(document).keydown(function(objEvent){_keyboard_action(objEvent);});}
function _disable_keyboard_navigation(){$(document).unbind();}
function _keyboard_action(objEvent){if(objEvent==null){keycode=event.keyCode;escapeKey=27;}else{keycode=objEvent.keyCode;escapeKey=objEvent.DOM_VK_ESCAPE;}
key=String.fromCharCode(keycode).toLowerCase();if((key==settings.keyToClose)||(key=='x')||(keycode==escapeKey)){_finish();}
if((key==settings.keyToPrev)||(keycode==37)){if(settings.activeImage!=0){settings.activeImage=settings.activeImage-1;_set_image_to_view();_disable_keyboard_navigation();}}
if((key==settings.keyToNext)||(keycode==39)){if(settings.activeImage!=(settings.imageArray.length-1)){settings.activeImage=settings.activeImage+1;_set_image_to_view();_disable_keyboard_navigation();}}}
function _preload_neighbor_images(){if((settings.imageArray.length-1)>settings.activeImage){objNext=new Image();objNext.src=settings.imageArray[settings.activeImage+1][0];}
if(settings.activeImage>0){objPrev=new Image();objPrev.src=settings.imageArray[settings.activeImage-1][0];}}
function _finish(){$('#jquery-lightbox').remove();$('#jquery-overlay').fadeOut(function(){$('#jquery-overlay').remove();});$('embed, object, select').css({'visibility':'visible'});}
function ___getPageSize(){var xScroll,yScroll;if(window.innerHeight&&window.scrollMaxY){xScroll=window.innerWidth+window.scrollMaxX;yScroll=window.innerHeight+window.scrollMaxY;}else if(document.body.scrollHeight>document.body.offsetHeight){xScroll=document.body.scrollWidth;yScroll=document.body.scrollHeight;}else{xScroll=document.body.offsetWidth;yScroll=document.body.offsetHeight;}
var windowWidth,windowHeight;if(self.innerHeight){if(document.documentElement.clientWidth){windowWidth=document.documentElement.clientWidth;}else{windowWidth=self.innerWidth;}
windowHeight=self.innerHeight;}else if(document.documentElement&&document.documentElement.clientHeight){windowWidth=document.documentElement.clientWidth;windowHeight=document.documentElement.clientHeight;}else if(document.body){windowWidth=document.body.clientWidth;windowHeight=document.body.clientHeight;}
if(yScroll<windowHeight){pageHeight=windowHeight;}else{pageHeight=yScroll;}
if(xScroll<windowWidth){pageWidth=xScroll;}else{pageWidth=windowWidth;}
arrayPageSize=new Array(pageWidth,pageHeight,windowWidth,windowHeight);return arrayPageSize;};function ___getPageScroll(){var xScroll,yScroll;if(self.pageYOffset){yScroll=self.pageYOffset;xScroll=self.pageXOffset;}else if(document.documentElement&&document.documentElement.scrollTop){yScroll=document.documentElement.scrollTop;xScroll=document.documentElement.scrollLeft;}else if(document.body){yScroll=document.body.scrollTop;xScroll=document.body.scrollLeft;}
arrayPageScroll=new Array(xScroll,yScroll);return arrayPageScroll;};function ___pause(ms){var date=new Date();curDate=null;do{var curDate=new Date();}
while(curDate-date<ms);};return this.unbind('click').click(_initialize);};})(jQuery);
/**
 * --------------------------------------------------------------------
 * jQuery-Plugin "pngFix"
 * Version: 1.1, 11.09.2007
 * by Andreas Eberhard, andreas.eberhard@gmail.com
 *                      http://jquery.andreaseberhard.de/
 *
 * Copyright (c) 2007 Andreas Eberhard
 * Licensed under GPL (http://www.opensource.org/licenses/gpl-license.php)
 */
/************ jq pngFix **************************************/
(function($){jQuery.fn.pngFix=function(settings){settings=jQuery.extend({blankgif:'blank.gif'},settings);var ie55=(navigator.appName=="Microsoft Internet Explorer"&&parseInt(navigator.appVersion)==4&&navigator.appVersion.indexOf("MSIE 5.5")!=-1);var ie6=(navigator.appName=="Microsoft Internet Explorer"&&parseInt(navigator.appVersion)==4&&navigator.appVersion.indexOf("MSIE 6.0")!=-1);if(jQuery.browser.msie&&(ie55||ie6)){jQuery(this).find('img[src$=".png"]').each(function(){jQuery(this).attr('width',jQuery(this).width());jQuery(this).attr('height',jQuery(this).height());var prevStyle='';var strNewHTML='';var imgId=(DOMPurify.sanitize(jQuery(this).attr('id')))?'id="'+DOMPurify.sanitize(jQuery(this).attr('id'))+'" ':'';var imgClass=(DOMPurify.sanitize(jQuery(this).attr('class')))?'class="'+DOMPurify.sanitize(jQuery(this).attr('class'))+'" ':'';var imgTitle=(DOMPurify.sanitize(jQuery(this).attr('title')))?'title="'+DOMPurify.sanitize(jQuery(this).attr('title'))+'" ':'';var imgAlt=(DOMPurify.sanitize(jQuery(this).attr('alt')))?'alt="'+DOMPurify.sanitize(jQuery(this).attr('alt'))+'" ':'';var imgAlign=(DOMPurify.sanitize(jQuery(this).attr('align')))?'float:'+DOMPurify.sanitize(jQuery(this).attr('align'))+';':'';var imgHand=(DOMPurify.sanitize(jQuery(this).parent().attr('href')))?'cursor:hand;':'';if(this.style.border){prevStyle+='border:'+this.style.border+';';this.style.border=''}if(this.style.padding){prevStyle+='padding:'+this.style.padding+';';this.style.padding=''}if(this.style.margin){prevStyle+='margin:'+this.style.margin+';';this.style.margin=''}var imgStyle=(this.style.cssText);strNewHTML+='<span '+imgId+imgClass+imgTitle+imgAlt;strNewHTML+='style="position:relative;white-space:pre-line;display:inline-block;background:transparent;'+imgAlign+imgHand;strNewHTML+='width:'+jQuery(this).width()+'px;'+'height:'+jQuery(this).height()+'px;';strNewHTML+='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader'+'(src=\''+DOMPurify.sanitize(jQuery(this).attr('src'))+'\', sizingMethod=\'scale\');';strNewHTML+=imgStyle+'"></span>';if(prevStyle!=''){strNewHTML='<span style="position:relative;display:inline-block;'+prevStyle+imgHand+'width:'+jQuery(this).width()+'px;'+'height:'+jQuery(this).height()+'px;'+'">'+strNewHTML+'</span>'}jQuery(this).hide();jQuery(this).after(strNewHTML)});jQuery(this).find("*").each(function(){var bgIMG=jQuery(this).css('background-image');if(bgIMG.indexOf(".png")!=-1){var iebg=bgIMG.split('url("')[1].split('")')[0];jQuery(this).css('background-image','none');jQuery(this).get(0).runtimeStyle.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+iebg+"',sizingMethod='scale')"}});jQuery(this).find("input[src$=.png]").each(function(){var bgIMG=jQuery(this).attr('src');jQuery(this).get(0).runtimeStyle.filter='progid:DXImageTransform.Microsoft.AlphaImageLoader'+'(src=\''+bgIMG+'\', sizingMethod=\'scale\');';jQuery(this).attr('src',settings.blankgif)})}return jQuery}})(jQuery);
/**
 * @author Alexander Farkas
 * v. 1.02
 */
/************     jq animate backgroundposition          *******************/
(function($){$.extend($.fx.step,{backgroundPosition:function(fx){if(fx.state===0&&typeof fx.end=='string'){var start=$.curCSS(fx.elem,'backgroundPosition');start=toArray(start);fx.start=[start[0],start[2]];var end=toArray(fx.end);fx.end=[end[0],end[2]];fx.unit=[end[1],end[3]]}var nowPosX=[];nowPosX[0]=((fx.end[0]-fx.start[0])*fx.pos)+fx.start[0]+fx.unit[0];nowPosX[1]=((fx.end[1]-fx.start[1])*fx.pos)+fx.start[1]+fx.unit[1];fx.elem.style.backgroundPosition=nowPosX[0]+' '+nowPosX[1];function toArray(strg){strg=strg.replace(/left|top/g,'0px');strg=strg.replace(/right|bottom/g,'100%');strg=strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");var res=strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);return[parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]]}}})})(jQuery);
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * 
 * Requires: 1.2.2+
 */
/************     jq mousewheel          *******************/
(function (a) { function d(b) { var c = b || window.event, d = [].slice.call(arguments, 1), e = 0, f = !0, g = 0, h = 0; return b = a.event.fix(c), b.type = "mousewheel", c.wheelDelta && (e = c.wheelDelta / 120), c.detail && (e = -c.detail / 3), h = e, c.axis !== undefined && c.axis === c.HORIZONTAL_AXIS && (h = 0, g = -1 * e), c.wheelDeltaY !== undefined && (h = c.wheelDeltaY / 120), c.wheelDeltaX !== undefined && (g = -1 * c.wheelDeltaX / 120), d.unshift(b, e, g, h), (a.event.dispatch || a.event.handle).apply(this, d) } var b = ["DOMMouseScroll", "mousewheel"]; if (a.event.fixHooks) for (var c = b.length; c; ) a.event.fixHooks[b[--c]] = a.event.mouseHooks; a.event.special.mousewheel = { setup: function () { if (this.addEventListener) for (var a = b.length; a; ) this.addEventListener(b[--a], d, !1); else this.onmousewheel = d }, teardown: function () { if (this.removeEventListener) for (var a = b.length; a; ) this.removeEventListener(b[--a], d, !1); else this.onmousewheel = null } }, a.fn.extend({ mousewheel: function (a) { return a ? this.bind("mousewheel", a) : this.trigger("mousewheel") }, unmousewheel: function (a) { return this.unbind("mousewheel", a) } }) })(jQuery)
/**************     url var getter    ***************************/
function getUrlVars(search) {
	let name = search.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
	let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getAjaxVars(ev){var vars=[],hash;var hashes=ev.split('&');for(var i=0;i<hashes.length;i++){hash=hashes[i].split('=');vars.push(hash[0]);vars[hash[0]]=hash[1]};return vars};
/*
 * jQuery outside events - v1.1 - 3/16/2010
 * http://benalman.com/projects/jquery-outside-events-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
/********************* jquery outside event ************************************/
(function($,c,b){$.map("click dblclick mousemove mousedown mouseup mouseover mouseout change select submit keydown keypress keyup".split(" "),function(d){a(d)});a("focusin","focus"+b);a("focusout","blur"+b);$.addOutsideEvent=a;function a(g,e){e=e||g+b;var d=$(),h=g+"."+e+"-special-event";$.event.special[e]={setup:function(){d=d.add(this);if(d.length===1){$(c).bind(h,f)}},teardown:function(){d=d.not(this);if(d.length===0){$(c).unbind(h)}},add:function(i){var j=i.handler;i.handler=function(l,k){l.target=k;j.apply(this,arguments)}}};function f(i){$(d).each(function(){var j=$(this);if(this!==i.target&&!j.has(i.target).length){j.triggerHandler(e,[i.target])}})}}})(jQuery,document,"outside");
/*
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
 /********************* resize event ************************************/
(function($,h,c){var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=250;e[f]=true;$.event.special[j]={setup:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.add(l);$.data(this,d,{w:l.width(),h:l.height()});if(a.length===1){g()}},teardown:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.not(l);l.removeData(d);if(!a.length){clearTimeout(i)}},add:function(l){if(!e[f]&&this[k]){return false}var n;function m(s,o,p){var q=$(this),r=$.data(this,d);r.w=o!==c?o:q.width();r.h=p!==c?p:q.height();n.apply(this,arguments)}if($.isFunction(l)){n=l;return m}else{n=l.handler;l.handler=m}}};function g(){i=h[k](function(){a.each(function(){var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}});g()},e[b])}})(jQuery,this);



var WEB_SITE_HREF="";
var WEB_SITE_TITLE="";
var FAVORITES="Favorites";
var FACEBOOK="FaceBook";
var GOOGLE="Google";
var PLURK="Plurk";
var SINA="Sina";
var TWITTER="Twitter";
var QQ="QQ";
var HAPPY="Happy";
var SO="So";
var REN = "Ren";
var ICON_IMAGE_PATH="images/anteaterBookmark/";
var FILE_NAME_EXTENSION=".png";
var bookmarkList=[FAVORITES,SINA,QQ,HAPPY,SO,REN,FACEBOOK,GOOGLE,PLURK,TWITTER];
function getBookmarkList(){return bookmarkList;}
function getBookmarkListIcon(){var _array=bookmarkList.concat();for(var i=0;i<_array.length;i++){_array[i]=ICON_IMAGE_PATH+_array[i]+FILE_NAME_EXTENSION;};return _array;};
function anteaterAddBookmark(pType,DOM){
	var _locationHref=(WEB_SITE_HREF=="")?window.location.href:WEB_SITE_HREF;
	_locationHref=encodeURIComponent(_locationHref);var _title=(WEB_SITE_TITLE=="")?document.title:WEB_SITE_TITLE;
	_title=encodeURIComponent(_title);var _href;
	switch(pType){
	case FAVORITES:
		anteaterAddFavorites();
		return;
		break;
	case SINA:
		_href="http://v.t.sina.com.cn/share/share.php?url="+_locationHref+"&title="+_title;
		break;
	case QQ:
		_href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+_locationHref+"&title="+_title;
		break;
	case HAPPY:
		_href="http://www.kaixin001.com/repaste/share.php??rurl="+_locationHref+"&rtitle="+_title;
		break;
	case SO:
		_href="http://t.sohu.com/third/post.jsp?url="+_locationHref+"&title="+_title;
		break;
	case REN:
		_href = "http://share.renren.com/share/buttonshare.do?link="+_locationHref+"&title="+_title;
		break;
		
	case FACEBOOK:
		_href="http://www.facebook.com/sharer.php?u="+_locationHref+"&title="+_title;
		break;
	case GOOGLE:
		_href="http://www.google.com/bookmarks/mark?op=add&bkmk="+_locationHref+"&title="+_title;
		break;
	case PLURK:
		_href="http://www.plurk.com/?qualifier=shares&status=".concat(_locationHref).concat(' ').concat('(').concat(_title).concat(')');
		break;
	case TWITTER:
		_href="http://twitter.com/home/?status="+_title+" "+_locationHref;
		break;
	};
	window.open(_href,"_blank");return false;
};
function anteaterAddFavorites(){var _title=(WEB_SITE_TITLE=="")?document.title:WEB_SITE_TITLE;var _locationHref=(WEB_SITE_HREF=="")?window.location.href:WEB_SITE_HREF;if(window.sidebar&&window.sidebar.addPanel){window.sidebar.addPanel(_title,_locationHref,'');}else if(window.external){window.external.AddFavorite(_locationHref,_title);}else if(document.layers){window.alert('Please click OK then press Ctrl+D to create a bookmark');}else{window.alert('Please use your browsers\' bookmarking facility to create a bookmark');}};
function echo(o){var s = "";for (var a in o) {if( o[a] instanceof Object ){s += a + " :" + echo( o[a] ) + '\n';}else{s += a + " = " + o[a] + '\n';}	}return s;}