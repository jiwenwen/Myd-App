var mydApp = new Vue({
    el: "#mydApp",
    data: {
        PageIndex: 0,
        typeid: '',
        projectLst: [],
        projectLst1: [],
        count: '',
        isScroll: '',
        role: '',
        topbarData:{
            projectNum:123,
            surveyNum:555,
            totalNum:99,
            verySa:99,
            satisfy:99,
            soso:99,
            notSa:99,
            complaints:99
        }
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    watch: {},
    methods: {
        init: function () {
            /*给搜索框value值*/
            if ($.cookie("search") && $.cookie("search").trim() != "") {
                $(".search-input").find("input").val($.cookie("search"));
            }

            /*监控手机enter*/
            $(".header-search").on("keydown", "input", function (event) {
                if (event.keyCode == 13) {
                    $.cookie("search", $(".search-input").find("input").val(), {path: "/"});
                    window.location.reload();
                }
            });

            /*给选中tab加下划线*/
            var $status = $.cookie("status") ? $.cookie("status") : 2;
            if ($status == 1) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-first").find("span")[0]).addClass("active");
            }
            else if ($status == 2) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-second").find("span")[0]).addClass("active");
            }
            else if ($status == 3) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-third").find("span")[0]).addClass("active");
            }
            else if ($status == 4) {
                this.PageIndex = 0;
                $(".tab-content").find("span").removeClass("active");
                $($(".tab-forth").find("span")[0]).addClass("active");
            }
            this.getCount();
            this.getSend();

            /*判断设备*/
            var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            if (isiOS) {
                $("html").css("padding-top", "20px");
                $("html").css("box-sizing", "border-box");
            }


            /*分页加载*/
            $(".detail").scroll(function () {
                var scrollTop = $(this).scrollTop();
                var $status = $.cookie("status") ? $.cookie("status") : 0;
                var scrollHeight = $(".list-first").height() - 130;
                var windowHeight = $(this).height();
                if (scrollTop + windowHeight >= scrollHeight && mydApp.projectLst1.length != 0 && mydApp.isScroll==0) {
                    mydApp.isScroll = 1;
                    mydApp.getSend();
                }
            });
        },
        /*tab切换*/
        tabChange:function(event){
            this.typeid= $(event.currentTarget).attr("typeid");
            if(this.typeid){
                $.cookie("status", this.typeid, {path: "/"});
                window.location.reload();
            }
        },
        /*获取列表*/
        getSend:function(){
            var $status = $.cookie("status") ? $.cookie("status") : 2;
            if ($.cookie("search") && $.cookie("search") != ""){
                var params={
                    "searchEntity.pageIndex":this.PageIndex,
                    "searchEntity.pageSize":10,
                    "searchEntity.commonSearchCondition":$.cookie("search"),
                    "searchEntity.approve_status":$status,
                    "searchEntity.searchEntity.roleid":0

                };
            }
            else{
                var params={
                    "searchEntity.pageIndex":this.PageIndex,
                    "searchEntity.pageSize":10,
                    "searchEntity.approve_status":$status,
                    "searchEntity.searchEntity.roleid":0
                };
            }
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetPmSatisfactionList",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.isScroll=response.data.status;
                    if (this.PageIndex==0){
                        this.projectLst1=response.data.data;
                        this.projectLst = response.data.data;
                        this.PageIndex ++;
                    }
                    else{
                        this.projectLst1=response.data.data;
                        this.projectLst=this.projectLst.concat(this.projectLst1);
                        this.PageIndex ++;
                    }
                    $(".loading").hide();
                }
                else{
                    util.notification.simple(result.msg);
                }
            }, function(response){
                util.notification.simple("网络连接异常");
            });
        },
        /*获取待处理数量*/
        getCount: function () {
            this.typeid = 1;
            var params = {
                "searchEntity.pageIndex": this.PageIndex,
                "searchEntity.pageSize": 99999,
                "searchEntity.approve_status":2,
                "searchEntity.searchEntity.roleid":0
            };
            this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetPmSatisfactionList", {params: params}).then(function (response) {
                var result = response.data;
                if (result.status==0) {
                    this.count = response.data.data.length;
                } else {
                    util.notification.simple(result.msg);
                }
            }, function (response) {
                util.notification.simple("网络连接异常");
            });
        },
        /*进入问题列表页面*/
        problemLst: function (event) {
            var $status = $.cookie("status") ? $.cookie("status") : 2;
            if (util._param.search) {
                window.location.href = "list.html?status=" + $status + "&pjId=" + $(event.currentTarget).attr("pjId") + "&search=" + util._param.search;
            }
            else {
                window.location.href = "list.html?status=" + $status + "&pjId=" + $(event.currentTarget).attr("pjId");
            }
        },
        /*点击+按钮*/
        submitProblem: function () {
            window.location.href = "submitQ.html";
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
            $.cookie("search", $(".search-input").find("input").val(), {path: "/"});
            window.location.reload();
        },
        /*删除搜索条件*/
        searchDelete: function () {
            $(".search-input").find("input").val("");
            $.cookie("search", "", {path: "/"});
            window.location.reload();
        }
    }
});
