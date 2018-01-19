var mydApp = new Vue({
    el: "#mydApp",
    data: {
        reportData: {},
        role:localStorage.getItem("Role")
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    watch: {},
    methods: {
        init: function () {
        	this.initDate();
        	this.initData();
        },
        initDate: function(){
			var currYear = (new Date()).getFullYear();
			var opt = {};
			opt.date = {
				preset: 'date'
			};
			opt.datetime = {
				preset: 'datetime'
			};
			opt.time = {
				preset: 'time'
			};
			opt.default = {
				theme: 'android-ics light', //皮肤样式
				display: 'modal', //显示方式 
				mode: 'scroller', //日期选择模式
				dateFormat: 'yyyy-mm-dd',
				lang: 'zh',
				showNow: true,
				nowText: "今天",
				startYear: currYear - 50, //开始年份
				endYear: currYear //结束年份
			};
			$("#startTime").mobiscroll($.extend(opt['date'], opt['default']));
			$("#endTime").mobiscroll($.extend(opt['date'], opt['default']));
			var now = new Date();
			var startDate = new Date(now.getTime() - 7862400000);
            var startTime = startDate.getFullYear() + "-" + ((startDate.getMonth() + 1) < 10 ? ("0" + (startDate.getMonth() + 1)) : (startDate.getMonth() + 1)) + "-" + (startDate.getDate() < 10 ? ("0" + startDate.getDate()) : startDate.getDate());
            var endTime = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? ("0" + (now.getMonth() + 1)) : (now.getMonth() + 1)) + "-" + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate());
            $("#startTime").val(startTime);
            $("#endTime").val(endTime);
            localStorage.setItem("startTime", startTime);
            localStorage.setItem("endTime", endTime);
            
            $("#startTime").on("change", function(event){
            	var endTime = $("#endTime").val();
	        	var startTime = $(this).val();
	        	if(startTime > endTime){
	        		util.notification.simple("起始时间不得大于截止时间");
	        		$(this).val("");
	        	}
	        	localStorage.setItem("startTime", startTime);
	        	mydApp.initData();
	        });
	        $("#endTime").on("change", function(event){
	        	var startTime = $("#startTime").val();
	        	var endTime = $(this).val();
	        	if(startTime > endTime){
	        		util.notification.simple("截止时间不得小于起始时间");
	        		$(this).val("");
	        	}
	        	localStorage.setItem("endTime", endTime);
	        	mydApp.initData();
	        });
		},
		initData: function(){
        	var startTime = localStorage.getItem("startTime");
        	var endTime = localStorage.getItem("endTime");
        	if(!startTime || !endTime || startTime > endTime){
        		return false;
        	}
        	var params = {
        		searchEntity: {
        			startTime: startTime,
        			endTime: endTime
        		}
        	}
        	util.submitCover(true);
        	this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetAllStatisticsNumReport",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                	if(result.data.FeedbackPercent){
                		result.data.FeedbackPercent = result.data.FeedbackPercent.toFixed(2);
                	}
                    this.reportData=result.data;
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
            this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetCompanyReport",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.initPie(response.data.data);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        toClassify: function(){
        	window.location.href = "classify.html";
        },
        initPie: function(initData){
        	var pieData = [
                {value:0, name:'非常满意'},
                {value:0, name:'满意'},
                {value:0, name:'一般'},
                {value:0, name:'不满意'},
                {value:0, name:'投诉'},
            ];
            for(var i = 0; i < initData.length; i ++){
            	pieData[0].value += initData[i].VerySatisfied;
            	pieData[1].value += initData[i].Satisfied;
            	pieData[2].value += initData[i].Commonly;
            	pieData[3].value += initData[i].Dissatisfied;
            	pieData[4].value += initData[i].Complaint;
            }
        	var myChart = echarts.init(document.getElementById("pie"));
        	option = {
			    title : {
			        show: false
			    },
			    color: ["#84B6BA","#75A1C1","#EECBA5","#E57752","#CE494B"],
			    tooltip : {
			        trigger: 'item',
			        formatter: "{a} <br/>{b} : {c} ({d}%)"
			    },
			    legend: {
			    	itemWidth: 15,
			    	itemHeight: 10,
			        x : 'center',
			        y : 'top',
			        data:['非常满意','满意','一般','不满意','投诉']
			    },
			    toolbox: {
			        show : false
			    },
			    calculable : true,
			    series : [
			        {
			            name:'满意度',
			            type:'pie',
			            radius: [30, 90],
			            center: ['50%', '50%'],
			            label: {
			            	normal: {
			            		show: true,
			            		formatter: '{b}: {c}'
			            	}
			            },
			            data: pieData
			        }
			    ]
			};
        	myChart.setOption(option);
        	myChart.on("click",function(params){
        		window.location.href = "pjPie.html";
        	});
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
        },
        toLink: function(event){
        	var $item = $(event.currentTarget);
        	var tgType = $item.attr("tgType");
        	var startTime = $("#startTime").val();
        	var endTime = $("#endTime").val();
        	if(!startTime || !endTime || startTime > endTime){
        		util.notification.simple("请选择正确的时间区间");
        		return false;
        	}
        	if(tgType == "1"){
        		window.location.href = "xm.html";
        	}else if(tgType == "2"){
        		window.location.href = "fk.html";
        	}else if(tgType == "3"){
        		window.location.href = "ts.html";
        	}else if(tgType == "4"){
        		window.location.href = "yq.html";
        	}else if(tgType == "5"){
        		window.location.href = "sd.html";
        	}else if(tgType == "6"){
        		window.location.href = "by.html";
        	}
        }
    }
});