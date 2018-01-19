var mydApp = new Vue({
    el: "#mydApp",
    data: {
        status:'',
        projectInfo:[],
        startTime:'',
        endTime:'',
        initProInfo:[],
        listInfo:[],
        listInfo1:[],
        PageIndex:0

    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    watch: {},
    methods: {
        init: function () {
            this.status = $.cookie("status") ? $.cookie("status") : 0;
			/*判断设备*/
			var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
			if(isiOS){
				$("html").css("padding-top","20px");
				$("html").css("box-sizing","border-box");
			}
            /*初始化页面项目信息*/
            var params1={
                "project_id":util._param.pjId
            };
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetProjectInfo",{params:params1}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.initProInfo=result.data;
                    $(".loading").hide()
                }
                else{
                    util.notification.simple(result.Msg);
                    $(".loading").hide()
                }
            }, function(response){
                util.notification.simple("网络连接异常");
                $(".loading").hide()
            });
            /*初始化页面列表信息*/
            this.getList();


            /*分页加载*/
            $(".detail").scroll(function () {
                var scrollTop = $(this).scrollTop();
                var scrollHeight = $(".list-first").height() - 130;
                var windowHeight = $(this).height();
                if (scrollTop + windowHeight >= scrollHeight && mydApp.listInfo1.length != 0 && mydApp.isScroll==0) {
                    mydApp.isScroll = 1;
                    mydApp.getList();
                }
            });



        },
        /*初始化页面列表信息*/
        getList:function(){
            var params={
                "searchEntity.pageIndex":this.PageIndex,
                "searchEntity.pageSize":10,
                "searchEntity.project_id":util._param.pjId
            };
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetSatisfactionList",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.isScroll=response.data.status;
                    if (this.PageIndex==0){
                        this.listInfo1=response.data.data;
                        this.listInfo = response.data.data;
                        this.PageIndex ++;
                    }
                    else{
                        this.listInfo1=response.data.data;
                        this.listInfo=this.listInfo.concat(this.listInfo1);
                        this.PageIndex ++;
                    }
                    $(".loading").hide()
                }
                else{
                    util.notification.simple(result.Msg);
                    $(".loading").hide()
                }
            }, function(response){
                util.notification.simple("网络连接异常");
                $(".loading").hide()
            });
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
        },
        /*返回*/
        goBack:function(){
            window.location.href="proList.html";
        },
        /*项目信息弹出框弹出以及获取接口数据*/
        proInfo:function(){
            $(".header").hide();
            $(".tab").hide();
            $(".detail").hide();
            $(".loading").show();
            $(".pro-info").show();

            var params={
                "searchEntity.project_Id":util._param.pjId
            };
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetProjectPersonnelInfo",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.projectInfo=result.data;
                    this.startTime=result.data.start_date.substr(0,10);
                    if(result.data.complete_date){
                        this.endTime='~'+result.data.complete_date.substr(0,10);

                    }
                    $(".loading").hide()
                }
                else{
                    util.notification.simple(result.Msg);
                    $(".loading").hide()
                }
            }, function(response){
                util.notification.simple("网络连接异常");
                $(".loading").hide()
            });
        },
        /*项目信息返回*/
        returnBack:function(){
            $(".header").show();
            $(".tab").show();
            $(".detail").show();
            $(".pro-info").hide();
        },
        /*进入详情*/
        enterDetail:function(){
            window.location.href="detail.html?satisId="+$(event.currentTarget).attr("satisId")+"&pjId="+util._param.pjId;

        }

    }
});
