var mydApp = new Vue({
    el: "#mydApp",
    data: {
        PageIndex: 0,
        typeid: '',
        sendLst: [],
        sendLst1: [],
        projectLst: [],
        projectLst1: [],
        count: '',
        isScroll: '',
        role: '',
        // isSearch:localStorage.getItem("isSearch")?localStorage.getItem("isSearch"):0
    	firstIn:true
    },
    created: function(){

    },
    mounted: function(){
        this.init();
    },
    watch: {

    },
    methods: {
        init: function(){
            /*判断是否显示搜索框*/
            /*if(this.isSearch!=0){
                $(".detail").css("top","6.2rem");
                $(".top_search").css("top","3.2rem");
            }*/

            /*给搜索框value值*/
            if ($.cookie("search") && $.cookie("search").trim() != "") {
                $(".search_input").find("input").val($.cookie("search"));
            }

            /*获取角色*/
            this.role=localStorage.getItem("Role");

            /*监控手机enter*/
            $(".header_search").on("keydown", "input", function (event) {
                if (event.keyCode == 13) {
                    $.cookie("search", $(".search_input").find("input").val(), {path: "/"});
                    window.location.reload();
                }
            });

            /*给tab加下划线*/
            var $status = $.cookie("status") ? $.cookie("status") : 1;
            if ($status == 1) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-third").find("span")[0]).addClass("active");
            }
            else if ($status == 2) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-second").find("span")[0]).addClass("active");
            }
            else if ($status == 3) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-forth").find("span")[0]).addClass("active");
            }
            this.getCount();
            this.getList();

            /*判断设备*/
            /*var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            if (isiOS) {
                $("html").css("padding-top", "20px");
                $("html").css("box-sizing", "border-box");
            }*/

            /*分页加载*/
            /*$(".detail").scroll(function () {
                var scrollTop = $(this).scrollTop();
                var scrollHeight = $(".list-first").height() - 130;
                var windowHeight = $(this).height();
                if (scrollTop + windowHeight >= scrollHeight && mydApp.projectLst1.length != 0&& mydApp.isScroll==0) {
                    mydApp.isScroll = 1;
                    mydApp.getList();
                }
            });*/
        },
        /*tab切换*/
        tabChange:function(event){
            this.typeid= $(event.currentTarget).attr("typeid");
            if(this.typeid){
                $.cookie("status", this.typeid, {path: "/"});
                window.location.reload();
            }
        },
        /*获取列表内容*/
        getList: function () {
            util.submitCover(true);
            var $status = $.cookie("status") ? $.cookie("status") : 1;
            if ($.cookie("search") && $.cookie("search") != "") {
                var params = {
                    "searchEntity.pageIndex": this.PageIndex,
                    "searchEntity.pageSize": 10,
                    "searchEntity.approve_status":$status,
                    "searchEntity.commonSearchCondition":$.cookie("search"),
                    "searchEntity.roleid":1,
                    "searchEntity.selectRole":2

                };
            }
            else {
                var params = {
                    "searchEntity.pageIndex": this.PageIndex,
                    "searchEntity.pageSize": 10,
                    "searchEntity.approve_status":$status,
                    "searchEntity.roleid":1,
                    "searchEntity.selectRole":2
                };
            }
            this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetPmSatisfactionList", {params: params}).then(function (response) {
                var result = response.data;
                if (result.status==0) {
                    this.isScroll = response.data.status;
                    if (this.PageIndex==0){
                        this.projectLst1=response.data.data;
                        this.projectLst = response.data.data;
                        this.PageIndex ++;
                        if(this.firstIn){
                            initScroll(function(myScroll){
                                myScroll.on('scrollEnd', function() {
                                    if (this.scrollerHeight + this.y - 20 < $('#wrapper').height() && (this.directionY === 0) && mydApp.projectLst1.length != 0) {
                                         mydApp.getList();
                                    }
                                });
                                myScroll.on('scrollStart',function() {
                                    // console.log(this);
                                    if(this.distY>10){
                                        // mydApp.isSearch = 1;
                                        // localStorage.setItem("isSearch",1);
                                        $(".detail").css("top","6.3rem");
                                        $(".top_search").css("top","3.2rem");
                                        refreshScroll();
                                    }
                                    if(this.distY<-10){
                                        // mydApp.isSearch = 1;
                                        // localStorage.setItem("isSearch",1);
                                        $(".detail").css("top","3.2rem");
                                        $(".top_search").css("top","-5px");
                                        refreshScroll();
                                    }
                                });
                            });
                        }
                    }
                    else{
                        this.projectLst1=response.data.data;
                        this.projectLst=this.projectLst.concat(this.projectLst1);
                        this.PageIndex ++;
                        refreshScroll();
                    }
                }
                else {
                    util.notification.simple("网络连接异常");
                }
                $(".loading").hide();
                util.submitCover(false);
            }, function (response) {
                errorFun(response,util);
                util.submitCover(false);
                util.notification.simple("网络连接异常");
                $(".loading").hide();
            });
        },
        /*获取待处理数量*/
        getCount: function () {
            var params = {
                "searchEntity.pageIndex": this.PageIndex,
                "searchEntity.pageSize": 99999,
                "searchEntity.approve_status":1,
                "searchEntity.roleid":1,
                "searchEntity.selectRole":2
            };
            this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetPmSatisfactionList", {params: params}).then(function (response) {
                var result = response.data;
                if (result.status==0) {
                    if(result.data){
                        this.count = response.data.data.length;
                    } else{
                        this.count=0;
                    }
                } else {
                    util.notification.simple(result.Msg);
                }
            }, function (response) {
                util.notification.simple("网络连接异常");
            });
        },
        /*进入问题列表页面*/
        problemLst: function (event) {
            var $status = $.cookie("status") ? $.cookie("status") : 1;
            if (util._param.search) {
                window.location.href = "list.html?status=" + $status + "&pjId=" + $(event.currentTarget).attr("pjId") + "&search=" + util._param.search;
            }
            else {
                window.location.href = "list.html?status=" + $status + "&pjId=" + $(event.currentTarget).attr("pjId");
            }
        },
        /*搜索项目*/
        searchProject: function () {
            $(".header-left").hide();
            $(".header-middle").hide();
            $(".header-right").hide();
            $(".header-search").show();
        },
        /*点击取消搜索按钮*/
        cancelSearch: function () {
            $(".header-left").show();
            $(".header-middle").show();
            $(".header-right").show();
            $(".header-search").hide();
        },
        /*点击退出按钮*/
        logOut: function () {
            if ($(event.currentTarget).attr("typeid") == 0) {
                $(".out").show();
                $(event.currentTarget).attr("typeid", "1");
                $(".black").show();

            }
            else {
                $(".out").hide();
                $(event.currentTarget).attr("typeid", "0");
                $(".black").hide();
            }
        },
        /*退出*/
        out: function () {
            var confirm = util.notification.confirm("确定要退出吗？", function (e, type) {
                if (type == true) {
                    //弹出提示框
                    if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                        /* logOut();*/
                    } else {
                        /*  window.GMQuality.logOut();*/
                    }
                    confirm.hide();
                    $(".black").hide();
                    $(".out").hide();
                } else {
                    confirm.hide();
                    $(".black").hide();
                    $(".out").hide();
                }
            });
            confirm.show();
        },
        /*搜索*/
        searchPj: function () {
            $.cookie("search", $(".search_input").find("input").val(), {path: "/"});
            window.location.reload();
        },
        /*删除搜索条件*/
        searchDelete: function () {
            $(".search_input").find("input").val("");
            $.cookie("search", "", {path: "/"});
            window.location.reload();
        }
    }
});