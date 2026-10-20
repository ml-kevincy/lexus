jQuery.fn.extend({
	fxClass:function (n,s){
		$(this).removeClass(s).eq(n).addClass(s);
		return $(this);
	},fxSameHeight:function (){
		var ourHeight=0;
		$(this).css({height:'auto'}).each(function (){
			if($(this).height() > ourHeight){
				ourHeight = $(this).height();
			};
		}).css({height:ourHeight+'px'});
		ourHeight=null;
		return $(this);
	}, fxCheck:function (o){
		return new function (d){
			var t = $(d);
			var out = this;
			var v = t.val();
			var regphone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
			var regmail = /^[^@^\s]+@[^\.@^\s]+(\.[^\.@^\s]+)+$/;
			var setting = {
				regPhone: regphone,
				regMail:regmail
			};
			for (i in o) setting[i] = o[i];

			out.isPhone = function (){
				if(setting.regPhone.test(v) ){
					return true;
				} else {
					return false;
				};
			}
			out.isMail = function (){
				if(v.match(setting.regMail) ){
					return true;
				} else {
					return false;
				};
			}	
	
		}(this);
	}, fxImgLoader:function(o){
		var loader = $(this);
		var setting = {
				imgLoaded:0,
				imgCount:0,
				imgSrc:'src',
				imgDOM:null,
				imgStrStart:'',
				imgStrEnd:'',
				onEach:null,
				onFinish:null,
				onLoaded:null
		};
		for (i in o) setting[i] = o[i];
		
		if(setting.imgDOM){
			if(setting.imgDOM.length > 0){
				setting.imgCount = setting.imgDOM.length;
				settingImg(0);
			} else {
				alert('imgDOM.length less than 1');
			};
		} else {
			if(setting.imgType=='' || setting.imgStr=='')alert('fxImgLoader require imgStrStart/imgStrEnd');
			if(setting.imgCount>0){
				settingImg(1);
			} else {
				alert('imgCount less than 1');
			};
		};
		function settingImg(n){
			for(var z =0;z<setting.imgCount;z++){
				var img = $('<img />');
				img.appendTo(loader);
				if(typeof(setting.onEach) == 'function')setting.onEach(z);
				img.attr('src', ((n==0)?setting.imgDOM.eq(z).attr(setting.imgSrc):setting.imgStrStart+z+setting.imgStrEnd) ).load(function(){
					img=null;
					setting.imgLoaded++;
					if(typeof(setting.onLoaded)== 'function' ){
						setting.onLoaded(setting.imgLoaded,setting.imgCount);
					}
					if(setting.imgLoaded >= setting.imgCount && typeof(setting.onFinish)== 'function' ){
						setting.onFinish();
					};
				}).each(function() {
					if(this.complete && $.browser.msie ) $(this).trigger('load');
				});
			};
		}
		return this;
	},fxSelect:function (o){
		return new function (d){
			var setting = {
					onChange:null,
					defaultName:''
			};
			for (i in o) setting[i] = o[i];
			var out = this;
			var t = $(d);
			var setVal = $('input',d);
			var setName = $('.name',d);
			var subDiv = $('div.sub',d);
			setting.defaultName = setName.text();
			var show = (subDiv.css('display') == 'none')?false:true;
			subDiv.find('a').live('click', function (){
				var val = $(this).attr('key');
				setVal.val(val);
				setName.text($(this).text());
				subDiv.hide();
				show=false;
				val=null;
				subDiv.find('a').removeClass('ON');
				$(this).addClass('ON');
				if(typeof(setting.onChange) == 'function'){
					setting.onChange({value:setVal.val(),name:setName.text(), index:$(this).index()});
				}
				return false;
			});
			setName.click(function(){
				if(show){
					t.css({position:'static'});
					subDiv.hide();
					show=false;
				} else {
					t.css({position:'relative'});
					subDiv.show();
					show=true;
					
				}
			});
			t.bind('clickoutside', function (){
				t.css({position:'static'});
				subDiv.hide();
				show=false;
			})
			out.writeVal = function (key){
				if(key==null){
					setVal.val('');
				} else {
					setVal.val(key);
				}
			};
			out.removeSub = function (){
				subDiv.find('*').remove();
				setVal.val('');
				setName.text(setting.defaultName);
			};
			out.clean = function (){
				setVal.val('');
				setName.text(setting.defaultName);
			};
			out.set = function (i){
				subDiv.find('a').eq(i).click();
			};
			
		}(this);
	},fxGrid: function (col,aSpeed,sorts,excep){
		return new function (d){

			var out =this;
			var box = $(d);
			
			var msie = false;
			if( $.browser.msie && $.browser.version == '6.0' || $.browser.version == '7.0' || $.browser.version == '8.0' || $.browser.version == '9.0' ){
				msie = true;
			};		
			var nowScale = col || false;
			var autoCol = (col)?false:true;
			var center = true;
			var centerX ;
			var eachImg =new Array();
			var win = $(window);
			var exfn = excep;
			eachImg.push(box.children('div'));
			for(var i=0;i<sorts;i++){
				if(i==0){
					eachImg[i] =box.children('div');
				} else {
					eachImg[i]=box.children('div.f'+i);
				}
				
			}
			
			var windowTimer;
			if(msie){
				var msieresize = false;
				$(window).resize(function (){
					if(box.width() != boxW ){
						clearTimeout(windowTimer);
						windowTimer = setTimeout(function (){
							setPos(recordNum);
						}, 500);
					}
				});
			} else{
				$(window).resize(function (){
					clearTimeout(windowTimer);
					windowTimer = setTimeout(function (){
						setPos(recordNum);
					}, 500);
				});
			}
	
			
			var getHeight = eachImg[0].eq(0).outerHeight(true);
			var imgBox;
			var imgNum = eachImg[0].eq(0).outerWidth(true);
			var boxW;
			var recordNum ;
			var setPosTimer;
			var maxHeight;
			//alert(imgNum);
			function setPos(num){
				eachImg[0].hide();
				eachImg[num].show();
				boxW = box.width();
				recordNum = num;

				maxHeight = new Array();
				imgBox = 100/nowScale;
				
				if(autoCol){
					nowScale = boxW/imgNum | 0;
				} else {
					imgNum = Math.round(box.width() * nowScale / 100);	
				};
				if(center){
					centerX = (boxW - imgNum*nowScale)/2 |0;
				}
				
				eachImg[num].each(function (i){
					if(!autoCol){
						this.style.width = imgNum + 'px';							
					}
					maxHeight[i]=Math.floor(i/nowScale)* getHeight;
					this.style.top = maxHeight[i] + 'px';
					this.style.left = (centerX?centerX:0) + (i%nowScale) * imgNum + 'px';
					maxHeight[i] += getHeight;

				});
				maxHeight = maxHeight.max();
				if(win.width() > 767){
					box.css({height:maxHeight+'px'});
				} else {
					box.css({height:'auto'});
				}
				if(exfn == 'collectListGrid'){
					
					if(win.width() > 767){
						if($('#collectionReturnTop')[0])$('#collectionReturnTop')[0].style.width = imgNum*nowScale+'px';
					} else {
						if($('#collectionReturnTop')[0])$('#collectionReturnTop')[0].style.width = 'auto';
					}
				}


				/*clearTimeout(setPosTimer);
				setPosTimer = setTimeout(function (){
					if(box.width() != boxW ){
						setPos(recordNum);	
					}
				}, 1010);*/
	
			};
			Array.prototype.max = function () {
				return Math.max.apply(Math, this);
			};
			var preid = 0;
			setPos(preid);
			/*box.find('img').eq(0).load(function (){
				setPos(0);
			});*/
			$(window).load(function (){
				getHeight = eachImg[preid].eq(0).outerHeight(true);
				setPos(preid);
			});
			out.runPos = function (n){
				preid = n;
				setPos(n);
			};
			
		}(this);
		
	}, fxSlide2: function (showAtOnce, animateSpeed, fxDirect, SORT){
		$(this).each(function(){
			if (!fxDirect) {
				alert('fxSlide error (showAtOnce『1,2,3』, animateSpeed『10,100,1000』, fxDirect『"h" or "v"』)');
			};
			var _this = $(this);
			var itemNum = $('.aItem > div', _this).length;
			
			var maxId = itemNum - showAtOnce;
			var itemWidth;
			var cId = 0;
			var aItem = $('.aItem', _this);
			var aLeft = $('.aLeft a', _this);
			var aRight = $('.aRight a', _this);

			if(fxDirect == 'h'){
				itemWidth = $('.aItem > div', _this).outerWidth(true);
				$('.aItem', _this).css({width : itemWidth * itemWidth + 10 + "px"});
			} else if(fxDirect == 'v') {
				itemWidth = $('.aItem > div', _this).outerHeight(true);
				$('.aItem', _this).css({height : itemWidth * itemWidth + 10 + "px"});
			};
			var slideWidth = itemNum * itemWidth;
			
			if (itemNum <= showAtOnce){
				aLeft.remove();
				aRight.remove();
			} else {
				/*_this.mousewheel(function(e, delta){
					if(delta > 0){
						cId--;
					} else if (delta < 0){
						cId++;
					};
					sliding (cId);
					return false;
				});*/
			};
			aLeft.click(function () {
				cId --;
				sliding (cId);
				$(this).blur();
				return false;
			});
			aRight.click(function () {
				cId ++;
				sliding (cId);
				$(this).blur();
				return false;
			});
			function sliding (SID, NUM){
				if(cId >= maxId && maxId > 0) {
					aRight.hide();
					aLeft.show();
					cId = maxId;
				} else if(cId <= 0) {
					aRight.show();
					aLeft.hide();
					cId = 0;
				} else {
					aLeft.show();
					aRight.show()
				};
				if (fxDirect == 'h') aItem.stop().animate( { marginLeft: - itemWidth * cId + "px" }, animateSpeed, 'easeOutExpo');
				if (fxDirect == 'v') aItem.stop().animate( { marginTop: - itemWidth * cId + "px" }, animateSpeed);

			};
			sliding();
			
		});
	}, 	fxSlide3: function (showAtOnce, animateSpeed, fxDirect){
		$(this).each(function(){
			if (!fxDirect) {
				alert('fxSlide error (showAtOnce『1,2,3』, animateSpeed『10,100,1000』, fxDirect『"h" or "v"』)');
			};
			var _this = $(this);
			var itemNum = $('.aItem > div', _this).length;
			
			var maxId = itemNum - showAtOnce;
			var itemWidth;
			var cId = 0;
			
			if(fxDirect == 'h'){
				itemWidth = $('.aItem > div', _this).outerWidth(true);
				$('.aItem', _this).css({width : itemWidth * itemWidth + 10 + "px"});
			} else if(fxDirect == 'v') {
				itemWidth = $('.aItem > div', _this).outerHeight(true);
				$('.aItem', _this).css({height : itemWidth * itemWidth + 10 + "px"});
			};
			var slideWidth = itemNum * itemWidth;
			
			if (itemNum <= showAtOnce){
				$('.aLeft > a', _this).remove();
				$('.aRight > a', _this).remove();
			} else {
				/*_this.mousewheel(function(e, delta){
					if(delta > 0){
						cId--;
					} else if (delta < 0){
						cId++;
					};
					sliding (cId);
					return false;
				});*/
			};
			$('.aLeft > a', _this).click(function () {
				cId --;
				sliding (cId);
				$(this).blur();
				return false;
			});
			$('.aRight > a', _this).click(function () {
				cId ++;
				sliding (cId);
				$(this).blur();
				return false;
			});
			function sliding (SID, NUM){
				if(cId >= maxId && maxId > 0) {
					$('.aRight > a', _this).hide();
					$('.aLeft > a', _this).show();
					cId = maxId;
				} else if(cId <= 0) {
					$('.aRight > a', _this).show();
					$('.aLeft > a', _this).hide();
					cId = 0;
				} else {
					$('.aRight > a, .aLeft > a', _this).show();
				};
				if (fxDirect == 'h') $('.aItem', _this).stop().animate( { marginLeft: - itemWidth * cId + "px" }, animateSpeed);
				if (fxDirect == 'v') $('.aItem', _this).stop().animate( { marginTop: - itemWidth * cId + "px" }, animateSpeed);
				$('#indexPage > a').removeClass().eq(cId).addClass('on');
			};
			sliding(cId, 1);
			$('#indexPage > a').click(function(){
				cId = $('#indexPage > a').index(this);
				sliding();
				return false;
			});
		});
	}, delight : function() {
		return this.each(function(){
			if($.browser.mozilla){
				$(this).css('MozUserSelect','none');
			}else if($.browser.msie){
				$(this).bind('selectstart',function(){return false;});
			}else{
				$(this).mousedown(function(){return false;});
			}
		});
	}, adllClass2 : function(STR){
		_tagName = this.tagName.toString().toLowerCase();
		$(this).parent().children(_tagName).removeClass(STR);
		$(this).addClass(STR);
		_tagName = null;
		return this;
	}, fxScroll: function(){
		$(this).each(function(){
			var _this = this;
			var fxSin2 = $(_this).children('div.fxSin2');	
			var selfHeight = fxSin2.children('div.fxSinBox').outerHeight(true);
			if( fxSin2.height() < selfHeight ){
				var scrollExpand = (($(document).width() - 880)*0.1 < 30)?30:($(document).width() - 880)*0.1;
				var scrollPX = Math.round($(document).height()/3);
				var difAmount;
				var fxSscroll = $(_this).children('div.fxSscroll').show();
				difAmount = selfHeight - fxSin2.outerHeight(true);
				var fxBoth = $('.fxSscroll, .fxSbarBG', fxSscroll);
				var fxSbar= $('.fxSbar', fxSscroll);
				var fxSinBox= fxSin2.children('div.fxSinBox');
				//fxBoth.css({height: $(_this).height() - 60 + 'px'});
				//scrollSize = scrollGrid - Math.floor(difAmount/scrollGrid);
				/*if( scrollSize < scrollMinSize){
					fxSbar.css({height:scrollMinSize+'%'});
				} else {
					fxSbar.css({height:scrollSize+'%'});
				};*/
				var barCenter = fxSbar.height() / 2;
				var barCenter2 = fxSscroll.height() - fxSbar.height();
				var topPoint = fxSscroll.offset().top + barCenter;
				var endPoint = fxSscroll.offset().top + fxSscroll.height() - (fxSbar.height()/2);
				var totalCanMove;
				//alert('barCenter:'+barCenter +'\nbarCenter2:' + barCenter2+ '\ntopPoint:' + topPoint + '\nendPoint:' + endPoint);
				var topClicked;
				var nowPoint = 0;
				var boxTop;
				fxSscroll.hover(function(){
					$(this)/*.bind('mousemove', fxScrollMoving)*/.css({width:scrollExpand+'px'}).children('div.fxSbarBG').stop().animate({opacity:0.7}, 500);
					//fxSbar.css({backgroundColor:'#0693f0'});
				}, function(){
					$(this)/*.unbind('mousemove', fxScrollMoving)*/.css({width:''}).children('div.fxSbarBG').stop().animate({opacity:0}, 500);
					//fxSbar.css({backgroundColor:''});
				})
				fxSinBox.resize(function(){
					selfHeight = $(this).outerHeight(true);
					difAmount = selfHeight - fxSin2.outerHeight(true);
				});
				$(window).resize(function(){
					difAmount = selfHeight - fxSin2.outerHeight(true);
					//fxBoth.css({height: $(_this).height() - 60 + 'px'});
					barCenter2 = fxSscroll.height() - fxSbar.height();
					topPoint = fxSscroll.offset().top + barCenter;
					endPoint = fxSscroll.offset().top + fxSscroll.height() - (fxSbar.height()/2);
				});
				fxSin2.resize(function(){
					difAmount = selfHeight - $(this).height();
				});
				$('.fxSbar, .fxSbarBG', fxSscroll).mousedown(function(e){
					if( e.pageY < topPoint){
						nowPoint = 0;
					} else if(e.pageY > endPoint){
						nowPoint = barCenter2;
					} else{
						nowPoint = e.pageY - topPoint;
					};
					fxSbar.css({backgroundColor:'#0693f0'});
					actingEv();
					$('body').bind('mousemove', fxScrollMoving);
					return false;
				});
				$('body').mouseup(function(){
					fxSbar.css({backgroundColor:''});
					$(this).unbind('mousemove', fxScrollMoving);
				});
				$('.fxSarrowUp a', fxSscroll).click(function(){
					nowPoint -= scrollPX;
					if(nowPoint < 0){
						nowPoint = 0;
					} else if( nowPoint > barCenter2 ){
						nowPoint = barCenter2;
					}
					actingEv();
				});
				$('.fxSarrowDown a', fxSscroll).click(function(){
					nowPoint += scrollPX;
					if(nowPoint < 0){
						nowPoint = 0;
					} else if( nowPoint > barCenter2 ){
						nowPoint = barCenter2;
					}
					actingEv();
				});
				$(_this).mousewheel(function(e, delta){
					if(delta > 0){
						actingEv2(1);
					} else if( delta < 0){
						actingEv2(0);
					};
				});
				function fxScrollMoving (e){
					if( e.pageY < topPoint){
						nowPoint = 0;
					} else if(e.pageY > endPoint){
						nowPoint = barCenter2;
					} else{
						nowPoint = e.pageY - topPoint;
					};
					actingEv();
					return false;
				};
				function actingEv (){
					fxSbar.css({top:nowPoint + 'px'});
					fxSinBox.css({top: -(difAmount * nowPoint / barCenter2 ) + 'px'});
				};
				function actingEv2(NUM){
					if( NUM == 0){
						NUM = fxSinBox.position().top - scrollPX;
					} else {
						NUM = fxSinBox.position().top + scrollPX;
					}
					if(NUM < -difAmount){
						NUM = -difAmount;
					} else if(NUM > 0){
						NUM = 0;
					}
					nowPoint = (-NUM)*barCenter2/difAmount;
					//document.title = nowPoint;
					fxSinBox.css({top: NUM + 'px'});
					fxSbar.css({top:nowPoint + 'px'});
					//document.title = nowPoint+'//'+fxSinBox.position().top;
					//fxSbar.css({top:nowPoint + 'px'});
					//fxSinBox.css({top: -(difAmount * nowPoint / barCenter2 ) + 'px'});
				};
			};
		});
		return this;
	},fxImgSlide : function(optionObj){
		var animateTypes = 11;
		$(this).each(function(){
			if( optionObj.style >= 0 && optionObj.style <= animateTypes){
			} else {
				alert('optionObj.style n/a');
				return;
			}
			var chopX = optionObj.chopX || 5;
			var chopY = optionObj.chopY || 5;
			var chopW;
			var chopH;
			var chopLeft;
			var chopTop;
			var choper;
			var animateDOM;
			
			var animateAmount = 100;
			var animateDelay = optionObj.delay || 100;
			var animateSpeed = optionObj.speed || 500;
			var arr=new Array();
			var newAr=new Array();
			var newArLen = chopX+chopY -1;
			var indexNUM = 0;
			var thisZindex = 2;
			var wheel = optionObj.wheel | false;
			choper = $('div.aItem > div', this);
			chopW = Math.floor( choper.width() / chopX);
			chopH = Math.floor( choper.height() / chopY);
			choper.each(function(i){
				if(i==0){
					$(this).css({zIndex:thisZindex});
				}
				var _this = this;
				if( optionObj.style != 11){
					for(var i=0;i<chopX;i++){
						chopLeft = i*chopW;
						$(_this).append(DOMPurify.sanitize('<div style="background:url('+DOMPurify.sanitize($(_this).children('img').attr('src'))+') -'+ chopLeft +'px 0;left:'+chopLeft+'px;top:0;width:'+chopW+'px;height:100%;"></div>'));
					}
					for(var i=0;i<chopY;i++){
						chopTop = i*chopH;
						$(_this).append(DOMPurify.sanitize('<span style="background:url('+DOMPurify.sanitize($(_this).children('img').attr('src'))+') 0 -'+ chopTop +'px;left:0;top:'+chopTop+'px;width:100%;height:'+chopH+'px;"></span>'));
					}
				} else {
					for(var i=0;i<chopY;i++){
						for(var j=0;j<chopX;j++){
							chopLeft = j*chopW;
							chopTop = i*chopH;
							$(_this).append(DOMPurify.sanitize('<p style="background:url('+DOMPurify.sanitize($(_this).children('img').attr('src'))+') -'+ chopLeft +'px -'+chopTop+'px;width:'+chopW+'px;height:'+chopH+'px;left:'+chopLeft+'px;top:'+chopTop+'px;"></p>'));
						}
					}
				}
				$('img',_this).hide();
			});
			if( optionObj.style == 11){
				for(var i = 0; i < newArLen; i++){
					for(var j = Math.min(chopY,i+1)-1; j >= Math.max(0,i-chopX+1); j--){
						arr.push((j*chopX)+i-j);
					}  
				}
				for(var i = 0;i <newArLen;i++){
					if (i<chopY){
						newAr.push(arr.splice(0, (i+1)) );
					} else if(i> newArLen-chopX){
						newAr.push(arr.splice(0, (chopY - (i-(newArLen-chopY)) )));
					} else {
						newAr.push(arr.splice(0, chopY) );
					}
				}
				arr = null;
			}
			chopY = chopX = chopLeft = chopTop = chopW = chopH = null;
			var thisA = $('.aPage a', this);
			thisA.click(function(){
				indexNUM = $(this).index();
				pageTab();
			});
			$('.aLeft a', this).click(function(){
				indexNUM--;
				pageTab();
			});
			$('.aRight a', this).click(function(){
				indexNUM++;
				pageTab();
			});
			if(wheel){
				$(this).mousewheel(function(e, delta){
					if(delta > 0){
						indexNUM--;	
					} else if(delta < 0){
						indexNUM++;
					}
					pageTab();
				});
			}
			function pageTab(){
				if(indexNUM < 0){
					indexNUM = choper.length -1;
				} if(indexNUM > choper.length -1 ){
					indexNUM = 0;
				}
				thisZindex++;
				thisA.removeClass('ON').eq(indexNUM).addClass('ON');
				animateDOM = choper.eq(indexNUM).css({zIndex:thisZindex});
				animateDOM.children('div,span, p').css({opacity:0, fontSize:'12px'});
				switch(optionObj.style){
					case 0:
						animateDOM.children('div,span').each(function(i){
							if( i  < chopX ){
								$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:0.3}, animateSpeed);
								});
							} else {
								$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1}, animateSpeed);
								});
							}
						});
						break;
					case 1:
						animateDOM.children('div').each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1}, animateSpeed);
							});
						});
						animateDOM.children('span').each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1}, animateSpeed);
							});
						});
						break;
					case 2:
						animateDOM.children('span').css({opacity:0}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1}, animateSpeed);
							});
						});
						break;
					case 3:
						animateDOM.children('div').css({opacity:0}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1}, animateSpeed);
							});
						});
						break;
					case 4:
						animateDOM.children('img').css({opacity:0.2, display:'block'});
						animateDOM.children('span').each(function(i){
							if(i%2 == 0){
								$(this).css({left:'-'+animateAmount+'px'}).animate({opacity:1, left:'0px'}, animateSpeed);
							} else {
								$(this).css({left:animateAmount+'px'}).animate({opacity:1, left:'0px'}, animateSpeed);
							}
						});
						animateDOM.children('div').each(function(i){
							if( i%2 == 0){
								$(this).css({top:'-'+animateAmount+'px'}).animate({opacity:1, top:'0px'}, animateSpeed);
							} else {
								$(this).css({top:animateAmount+'px'}).animate({opacity:1, top:'0px'}, animateSpeed);
							}
						});
						
						break;
					case 5:
						animateDOM.children('span').css({left:animateAmount+'px'}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1, left:'0px'}, animateSpeed);
							});
						});
						break;
					case 6:
						animateDOM.children('div').css({top:-animateAmount+'px'}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1, top:'0px'}, animateSpeed);
							});
						});
						break;
					case 7:
						animateDOM.children('span').each(function(i){
							if(i%2 == 0){
								$(this).css({left:'-'+animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, left:'0px'}, animateSpeed);
								});
							} else {
								$(this).css({left:animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, left:'0px'}, animateSpeed);
								});
							}
							
						});
						break;
					case 8:
						animateDOM.children('div').each(function(i){
							if( i%2 == 0){
								$(this).css({top:'-'+animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, top:'0px'}, animateSpeed);
								});
							} else {
								$(this).css({top:animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, top:'0px'}, animateSpeed);
								});
							}
						});
						break;
					case 9:
						animateDOM.children('span').each(function(i){
							if(i%2 == 0){
								$(this).css({left:'-'+animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, left:'0px'}, animateSpeed);
								});
							} else {
								$(this).css({left:animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, left:'0px'}, animateSpeed);
								});
							}
							
						});
						animateDOM.children('div').each(function(i){
							if( i%2 == 0){
								$(this).css({top:'-'+animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, top:'0px'}, animateSpeed);
								});
							} else {
								$(this).css({top:animateAmount+'px'}).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1, top:'0px'}, animateSpeed);
								});
							}
						});
						break;
					case 10:
						animateDOM.children('span').css({left:'-'+animateAmount+'px'}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1, left:'0px'}, animateSpeed);
							});
						});
						animateDOM.children('div').css({top:animateAmount+'px'}).each(function(i){
							$(this).animate({fontSize:'20px'}, i*animateDelay, function(){
								$(this).animate({opacity:1, top:'0px'}, animateSpeed);
							});
						});
						break;
					case 11:
						for(var i in newAr){
							for( var j in newAr[i]){
								animateDOM.children('p').eq(newAr[i][j]).animate({fontSize:'20px'}, i*animateDelay, function(){
									$(this).animate({opacity:1}, animateSpeed);
								});
							};
						};
						break;
				}
			}
		});
		return this;
	}
});

function fxCirSlide(DOM) {
	var _this = $(DOM);
	var _thisAR = $('.htmlArray', _this);
    var maxDivision = $('.tvcfCenter > div', _this).length;
	var cHigher = 100;//current target higher X axis
	var smallCwidth = 200;
	var bigCwidth = 300;
    var radiusX = 200;
    var radiusY = 80;
    var cPI = Math.PI * 2 / 4;
    var xPI = Math.PI * 2 / maxDivision;
    var dId = 0;
	var cArray = new Array();
    $('.tvcfCenter > div', _this).each(function(i) {
        var seta = xPI * i + cPI;
        var tY = Math.floor((Math.sin(seta)) * radiusY);
        var tX = Math.floor((Math.cos(seta)) * radiusX);
        var opa = Math.floor((tY + (radiusY + (radiusY*0.1))) / (radiusY*2) * 1000) / 1000;
		var cObj;
        if (i != 0) {
			cObj = {
				ty: tY,
				tx: tX,
				wid: smallCwidth,
				zin:Math.floor(tY),
				opa:opa,
				ord:i
			};/*
            $('<b ty="' + tY + '" tx="' + tX + '" wid="' + smallCwidth + '" zin="' + Math.floor(tY) + '" opa="' + opa + '"></b>').appendTo(_thisAR);*/
            $(this).css({ zIndex: Math.floor(tY), top: tY + 'px', left: tX + 'px' });
            $('img', this).css({ width: smallCwidth + 'px' });
            $('a', this).css({ left: -(smallCwidth/ 2) + 'px', opacity: opa });
        } else {
			cObj = {
				ty: tY-cHigher,
				tx: tX,
				wid: bigCwidth,
				zin:Math.floor(tY),
				opa:opa,
				ord:i
			};/*
            $('<b ty="' + (tY - 100) + '" tx="' + tX + '" wid="' + bigCwidth + '" zin="' + Math.floor(tY) + '" opa="' + opa + '"></b>').appendTo(_thisAR);**/
            //$(this).css({zIndex:Math.floor(tY), top:tY - 100 +'px', left:tX+'px', width:'222px'});
            $(this).css({ zIndex: Math.floor(tY), top: tY - 100 + 'px', left: tX + 'px' });
            $('img', this).css({ width: bigCwidth + 'px' });
            $('a', this).css({ width: -(bigCwidth/2) + '0px', opacity: opa });
        };
		cArray.push(cObj);
    });
	$('.aNum i', _this).text( cArray[0].ord + 1 + ' / '+ maxDivision);
    $('.aLeft', _this).click(function() {
        //$('.htmlArray b:last-child').prependTo(_thisAR);
		cArray.unshift( cArray.pop() );
        run3D();
        $(this).blur();
        return false;
    });
    $('.aRight', _this).click(function() {
        //$('.htmlArray b:first-child').appendTo(_thisAR);
		cArray.push( cArray.shift() );
        run3D();
        $(this).blur();
        return false;
    });
    $(_this).mousewheel(function(e, delta) {
        if (delta > 0) {
            //$('b:last-child', _thisAR).prependTo(_thisAR);
			cArray.unshift( cArray.pop() );
        } else {
            //$('b:first-child', _thisAR).appendTo(_thisAR);
			cArray.push( cArray.shift() );
        };
        run3D();
        return false;
    });
    function run3D() {
        $('.tvcfCenter > div', _this).each(function(j) {/*
            $(this).stop().animate({
                top: $('.htmlArray b').eq(j).attr('ty') + 'px',
                left: $('.htmlArray b').eq(j).attr('tx') + 'px'
            }, 300).css({ zIndex: $('b', _thisAR).eq(j).attr('zin') });
            $('img', this).stop().animate({ width: $('b', _thisAR).eq(j).attr('wid') + 'px' }, 200);
            $('a', this).stop().animate({ left: -($('b', _thisAR).eq(j).attr('wid') / 2) + 'px', opacity: $('b', _thisAR).eq(j).attr('opa') }, 200);*/
            $(this).stop().animate({
                top: cArray[j].ty + 'px',
                left: cArray[j].tx + 'px'
            }, 300).css({ zIndex: cArray[j].zin });
            $('img', this).stop().animate({ width: cArray[j].wid + 'px' }, 200);
            $('a', this).stop().animate({ left: -( cArray[j].wid / 2) + 'px', opacity: cArray[j].opa }, 200);
        });
		$('.aNum i', _this).text( cArray[0].ord + 1 + ' / '+ maxDivision);
    };
	
};