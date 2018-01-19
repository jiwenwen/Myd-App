var pageInit = function(){};
Vue.http.options.timeout = 30000;
function errorFun(response,util){
	if(response.status==401){
		util.notification.simple("重新连接中...");
		if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
            refreshToken();
            $("#decoration").append("更新Token:");
        }else{
            window.GMQuality.refreshToken();
            $("#decoration").append("更新Token:");
        }
	}else{
        $("#decoration").append("<span style='color:red;'>网络故障</span>");
		util.notification.simple("网络连接异常");
	}
}
//设置header里token
var setVueHttp = function(token){
    for(var i = 0; i < Vue.http.interceptors.length; i ++){
        var funString = Vue.http.interceptors[i].toString();
        if(funString.indexOf("tokenVal") > -1){
            Vue.http.interceptors.splice(i, Vue.http.interceptors.length - i);
            break;
        }
    }
    Vue.http.interceptors.push(function(request,next){
        var tokenVal="Basic "+token;
        request.headers['map']['Authorization'] = [tokenVal];
        next(function (response) {
        });
    });
    
};
var now_str = location.href;
if(now_str.indexOf("src/html/index.html") < 0){
    var token=localStorage.getItem("token");
    setVueHttp(token);
}
//获取角色权限
var getRole = function(){
    $("#decoration").append("获取用户角色:");
    var celarTime = null;
	var roleApp = new Vue();
    clearTime = setTimeout(function(){
        $("#decoration").append("出现错误<br /><span style='color:red;'>请求超时</span>");
    },30000);
	roleApp.$http.get("http://mobile.goldmantis.com:9082/api/PMSatisfactionsAPI/GetRoleByToken").then(function(response){
        clearTimeout(celarTime);
        var role = [];
        var juese = {"1":"工管中心","2":"项目经理","3":"仅查看","4":"项目经理仅查看","5":"营销人员","111":"仅查看"};
        var roleUrl = {"1":"emc/proList.html","2":"pm/proList.html","3":"emc/proList.html","4":"pm/proList.html","5":"yx/proList.html","111":"emc/proList.html"};
        if(response.data){
            role = response.data.Role;
        }
        if(role.length>1){
            var elements = "<ul>";
            for(var i = 0;i<role.length;i++){
                elements+="<li type="+role[i]+"><p>"+juese[role[i]]+"</p></li>";
            }
            elements+="</ul>";
            $(".switch").append(elements);
            $(".switch").show();
            $(".switch").on("click", "li", function() {
                localStorage.setItem("Role",$(this).attr("type"));
                var roleType = parseInt($(this).attr("type"));
                if(roleType==1||roleType==3||roleType==5||roleType==111){
                    $.cookie("status", 2, {path: "/"});
                }else if(roleType==2||roleType==4){
                    $.cookie("status", 1, {path: "/"});
                }
                window.location = roleUrl[$(this).attr("type")];
            });
         }else{
            if(!role[0]||!juese[role[0]]){
                $("#decoration").append("没有权限<br />");
                indexUtil.notification.simple("您没有权限，请联系管理员!!!");
                setTimeout(function(){
                    if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                        logOut();
                    }else{
                        window.GMQuality.logOut();
                    }
                },2000);
            }else{
                $("#decoration").append(juese[role[0]]);
                $("#decoration").append("跳转中...");
                localStorage.setItem("Role",role[0]);
                var roleType = parseInt(role[0]);
                if(roleType==1||roleType==3||roleType==111||roleType==5){
                    $.cookie("status", 2, {path: "/"});
                }else if(roleType==2||roleType==4){
                    $.cookie("status", 1, {path: "/"});
                }
                window.location.href = roleUrl[role[0]];
            }   
        }
    }, function(response){
        clearTimeout(celarTime);
        $("#decoration").append("出现错误<br />正在重试...<br />");
        errorFun(response,indexUtil);
    });
};
function gm_refreshToken(newToken){
    $("#decoration").append("完成<br />");
	localStorage.setItem("token",newToken);
    $("#decoration").append("更新头:");
	setVueHttp(newToken);
    $("#decoration").append("完成<br />");
	var str = location.href;
	if(str.indexOf("src/html/index.html") > -1){
		getRole();
	}else{
        window.location.reload();
    }
}
function gm_getToken(oldToken){
    $("#decoration").append(oldToken+"已获取<br />");
	localStorage.setItem("token",oldToken);
    $("#decoration").append("更新头:");
	setVueHttp(oldToken);
    $("#decoration").append("完成<br />");
    var str = window.location.href;
	if(str.indexOf("src/html/index.html") > -1){
        getRole();
    }else{
        pageInit();
    }
}
/*iscroll-start*/
var myScroll = null;
function initScroll(callback){
    setTimeout(function(){
        myScroll = new IScroll('#wrapper', { click: true,mouseWheel: true });
        callback(myScroll);
    },300);
}
function refreshScroll(){
    setTimeout(function(){
        myScroll.refresh();
    },300);
}
/*iscroll-end*/

var util = (function(){
	var coverTimeout = null;
    var baseUrl = "http://mobile.goldmantis.com:9082/api/";
	// var baseUrl = "http://172.16.55.29:8087/api/";
    var notification = (function () {
        function dialog(opt) {
            this._options = $.extend({
                mode: "msg",
                text: "网页提示",
                icon: {},
                useTap: false,
                isResize: true,
                hasBlankDiv: false
            }, opt || {}),
            this._init();
        };
        var html = ['<div class="c-float-popWrap msgMode hide">',
            '<div class="c-float-modePop">',
            '<i class="warnIcon fa"></i>',
            '<div class="warnMsg"></div>',
            '<div class="warnCon"></div>',
            '<div class="doBtn">',
            '<button class="cancel">取消</button>',
            '<button class="ok">确认</button>',
            "</div>",
            "</div>",
            "</div>"].join("");
        var $blankDiv = $(
            '<div style="bottom: 0;left: 0;overflow: hidden;position: fixed;right: 0;top: 0;z-index: 400;background-color: rgba(255,255,255,0.3);display:none;"></div>');
        var $ele = $(html);
        var $text = $ele.find(".warnMsg");
        var $content = $ele.find(".warnCon");
        var $icon = $ele.find(".warnIcon");
        var $okBtn = $ele.find(".doBtn .ok");
        var $cancelBtn = $ele.find(".doBtn .cancel");
        var isInit = false;
        var timeId;
 
        $.extend(dialog.prototype, {
            _init: function () {
                var self = this;
                var opt = self._options;
                var callback = opt.callback;
                var type = opt.useTap ? "tap" : "click";
                var className = $ele.attr("class").replace(/(msg|alert|confirm)Mode/i, opt.mode + "Mode");
                $ele.attr("class", className);
                if (opt.content) {
                	$content.show();
                    $ele.css("background", opt.background);
                }else{
                	$content.hide();
                }
                $text.html(opt.text);
                if(opt.content){
                	$content.html(opt.content);
                }
                if(opt.icon.class){
                	$icon.removeClass();
                	$icon.addClass("fa warnIcon " + opt.icon.class);
                	$icon.css({"color": opt.icon.color || "#FFAD02"});
                	$text.css({"padding-left": "60px"});
                	$cancelBtn.css({"right": "0"});
                	$icon.show();
                }else{
                	$text.css({"padding-left": "0"});
                	$cancelBtn.css({"right": "0"});
                	$icon.hide();
                }
                $okBtn.off(type).on(type, function (e) {
                    callback.call(self, e, true);
                });
 
                $cancelBtn.off(type).on(type, function (e) {
                    callback.call(self, e, false);
                });
                if (isInit == false) {
                    isInit = true;
                    $blankDiv.click(function () {
                        self.hide();
                    });
                    $("body").append($blankDiv);
                    $("body").append($ele);
                    if (opt.isResize) {
                        $(window).bind("resize", function () {
                            setTimeout(function () {
                                self._pos();
                            },
                                500);
                        });
                    }
                }
            },
            _pos: function () {
                var doc = document;
                var docEle = doc.documentElement;
                var body = doc.body;
                var self = this;
                if (self.isHide() == false) {
                    $ele.css({
                        top: body.scrollTop + (docEle.clientHeight - $ele.height()) / 2,
                        left: body.scrollLeft + (docEle.clientWidth - $ele.width()) / 2
                    });
                }
            },
            isShow: function () {
                return $ele.hasClass("show");
            },
            isHide: function () {
                return $ele.hasClass("hide");
            },
            _cbShow: function () {
                var onShow = this._options.onShow;
                $ele.css("opacity", "1").addClass("show");
                if (onShow) {
                    onShow.call(this);
                }
            },
            show: function () {
                timeId && (clearTimeout(timeId), timeId = void 0);
                var self = this;
                if (this.isShow()) {
                    this._cbShow();
                } else {
                    $ele.css("opacity", "0").removeClass("hide");
                    var hasBlankDiv = this._options.hasBlankDiv;
                    if (hasBlankDiv) {
                        $blankDiv.show();
                    }
                    self._pos();
                    setTimeout(function () {
                        self._cbShow();
                    }, 300);
                    setTimeout(function () {
                        $ele.animate({
                            opacity: "1"
                        }, 300, "linear");
                    }, 1);
                }
            },
            _cbHide: function () {
                var onHide = this._options.onHide;
                $ele.css("opacity", "0").addClass("hide");
                if (onHide) {
                    onHide.call(this);
                }
            },
            hide: function () {
                var self = this;
                if (this.isHide()) {
                    this._cbHide();
                } else {
                	$ele.removeClass("show");
                    $ele.css("opacity", "1");
                    var hasBlankDiv = this._options.hasBlankDiv;
                    if (hasBlankDiv) {
                        $blankDiv.hide();
                    }
                    setTimeout(function () {
                        self._cbHide();
                    }, 300);
                    setTimeout(function () {
                        $ele.animate({
                            opacity: "0"
                        }, 300, "linear");
                    }, 1);
                }
            },
            flash: function (time) {
                var self = this;
                self._options.onShow = function () {
                    timeId = setTimeout(function () {
                        timeId && self.hide();
                    }, time);
                },
                self.show();
            }
        });
        return {
            simple: function (text, icon, bground, time) {
                if (2 == arguments.length && "number" == typeof arguments[1]) {
                    time = arguments[1];
                    bground = void 0;
                }
                var obj = new dialog({
                    mode: "msg",
                    text: text,
                    icon: icon,
                    background: bground
                });
                obj.flash(time || 2000);
                setTimeout(function(){
                	$ele.removeClass("show");
                },4000);
                return obj;
            },
            msg: function (text, opt) {
                return new dialog($.extend({
                    mode: "msg",
                    text: text
                }, opt || {}));
            },
            alert: function (text, callback, icon, opt) {
                return new dialog($.extend({
                    mode: "alert",
                    text: text,
                    icon: icon,
                    callback: callback
                }, opt || {
                    hasBlankDiv: true
                }));
            },
            confirm: function (text, callback, content, icon, opt) {
                return new dialog($.extend({
                    mode: "confirm",
                    text: text,
                    content: content,
                    icon: icon,
                    callback: callback
                }, opt || {}));
            },
            pop: function (opt) {
                return new dialog(opt);
            }
        };
    })();
    (function ($) {
        var pluses = /\+/g;
 
        function encode(s) {
            return config.raw ? s : encodeURIComponent(s);
        }
 
        function decode(s) {
            return config.raw ? s : decodeURIComponent(s);
        }
 
        function stringifyCookieValue(value) {
            return encode(config.json ? JSON.stringify(value) : String(value));
        }
 
        function parseCookieValue(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape...
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            try {
                // Replace server-side written pluses with spaces.
                // If we can't decode the cookie, ignore it, it's unusable.
                s = decodeURIComponent(s.replace(pluses, ' '));
            } catch (e) {
                return;
            }
            try {
                // If we can't parse the cookie, ignore it, it's unusable.
                return config.json ? JSON.parse(s) : s;
            } catch (e) {}
        }
 
        function read(s, converter) {
            var value = config.raw ? s : parseCookieValue(s);
            return $.isFunction(converter) ? converter(value) : value;
        }
 
        var config = $.cookie = function (key, value, options) {
            if (value !== undefined && !$.isFunction(value)) {
                options = $.extend({}, config.defaults, options);
                if (typeof options.expires === 'number') {
                    var days = options.expires / (60 * 24),
                        t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }
                return (document.cookie = [
                    encode(key), '=', stringifyCookieValue(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
 
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }
            var result = key ? undefined : {};
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            for (var i = 0, l = cookies.length; i < l; i++) {
                var parts = cookies[i].split('=');
                var name = decode(parts.shift());
                var cookie = parts.join('=');
                if (key && key === name) {
                    result = read(cookie, value);
                    break;
                }
                if (!key && (cookie = read(cookie)) !== undefined) {
                    result[name] = cookie;
                }
            }
            return result;
        };
        config.defaults = {};
        $.removeCookie = function (key, options) {
            if ($.cookie(key) !== undefined) {
                $.cookie(key, '', $.extend({}, options, {
                    expires: -1
                }));
                return true;
            }
            return false;
        };
    })($);
    var getParam = function (search) {
        search = search.replace(/#.+$/, '');
        var re = {};
        if (search == "" || typeof search == "undefined") {
            return {};
        } else {
 
            search = search.substr(1).split('&');
            for (var i = 0, len = search.length; i < len; i++) {
                var tmp = search[i].split('=');
                if (i == 0 && tmp.length == 1) { //?132141
                    return {
                        '__search__': tmp[0]
                    };
                }
                re[tmp.shift()] = tmp.join('=');
            }
            return re;
        }
    };
	var formatTime = function(ms, flag){
		if(ms){
			var newDate = new Date();
			newDate.setTime(ms);
			var year = newDate.getFullYear();
			var mouth = (newDate.getMonth() + 1) < 10 ?  ("0" + (newDate.getMonth() + 1)) : (newDate.getMonth() + 1);
			var day = newDate.getDate() < 10 ? ("0" + newDate.getDate()) : newDate.getDate();
			var hours = newDate.getHours() < 10 ? ("0" + newDate.getHours()) : newDate.getHours();
			var mins = newDate.getMinutes() < 10 ? ("0" + newDate.getMinutes()) : newDate.getMinutes();
			var secs = newDate.getSeconds() < 10 ? ("0" + newDate.getSeconds()) : newDate.getSeconds();
			if(flag == "hour"){
				return  year + "." + mouth + "." + day;
			}else{
				return year + "." + mouth + "." + day + " " + hours + ":" + mins + ":" + secs;
			}
		}else{
			return 0;
		}
	};
	var toThousands = function(){
		$(".num-format").each(function(){
			var tempNum = "";
			var num = $(this).html();
			if(num && num != ""){
				var integer = num.split(".")[0];
				var decimal = num.split(".")[1];
				if(decimal){
					tempNum = integer.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + "." + decimal;
				}else{
					tempNum = integer.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
				}
			}else{
				tempNum = "";
			}
			$(this).html(tempNum);
		});
	};
	var getObjectURL = function(file){
		var url = null;
        if (window.createObjectURL != undefined) {
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) {
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) {
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
	};
    var fileToBase64 = function($item,callback){
    	//检验是否为图像文件  
    	var result = {
    		success: false,
    		imgUrl: "",
    		size: -1
    	};
	    if (navigator.userAgent.indexOf("MSIE") > -1) {
			try {
				result.success = true;
				var imgUrl = getObjectURL($item.files[0]);
				var img = new Image();
				img.src = imgUrl;
				result.imgUrl = imgUrl;
				result.size = $item.files[0].size;
				img.onload = function() {
					var canvas = document.createElement('canvas'); 
					canvas.height = img.height;
					canvas.width = img.width;
					var ctx=canvas.getContext("2d");
					ctx.drawImage(img, 0, 0);
					result.base64 = canvas.toDataURL();
					callback(result);
				};
			} catch (e) {
				
			}
		} else {
			result.success = true;
			var imgUrl = getObjectURL($item.files[0]);
			var img = new Image();
			img.src = imgUrl;
			result.imgUrl = imgUrl;
			result.size = $item.files[0].size;
			img.onload = function() {
				var canvas = document.createElement('canvas'); 
				canvas.height = img.height;
				canvas.width = img.width;
				var ctx=canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);
				result.base64 = canvas.toDataURL();
				callback(result);
			};
		}
        return false;
   	};
    var submitCover = function(flag){
		if(flag){
			clearTimeout(coverTimeout);
			$(".submit-cover").show();
			coverTimeout = setTimeout(function(){
				notification.simple("请求超时，请重试");
				$(".submit-cover").hide();
                $(".loading").hide();
			},30000);
		}else{
			$(".submit-cover").hide();
			clearTimeout(coverTimeout);
		}
	};
    return {
    	baseUrl: baseUrl,
		notification: notification,
		_param: getParam(window.location.search),
		formatTime: formatTime,
		toThousands: toThousands,
		fileToBase64: fileToBase64,
		submitCover: submitCover
    };
})();