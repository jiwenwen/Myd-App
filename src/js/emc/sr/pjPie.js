var mydApp = new Vue({
    el: "#mydApp",
    data: {
        reportList:[]
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    computed: {
    	totalNum: function(){
    		var totalNum = 0;
    		for(var i = 0; i < this.reportList.length; i ++){
    			totalNum += (this.reportList[i].ThreeorFive + this.reportList[i].Five);
    		}
    		return totalNum;
    	}
    },
    methods: {
        init: function () {
        	this.initData();
            /*监控手机enter*/
            $(".header-search").on("keydown", "input", function (event) {
                if (event.keyCode == 13) {
                    $.cookie("search", $(".search-input").find("input").val(), {path: "/"});
                    window.location.reload();
                }
            });
            /*判断设备*/
          /*  var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            if (isiOS) {
                $("html").css("padding-top", "20px");
                $("html").css("box-sizing", "border-box");
            }*/
        },
        //返回上一级
        goBack: function(){
        	window.history.back();
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
        	this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetCompanyReport",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                	this.reportList = response.data.data;
                    this.initLine(response.data.data);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        //切换表单&柱状图
        changeTap: function(event){
        	var $item = $(event.currentTarget);
        	if(!$item.hasClass("active")){
        		$(".f-tap .active").removeClass("active");
        		$item.addClass("active");
        		var itemType = $item.attr("type");
        		if(itemType == '1'){
        			$(".con-line").hide(100);
        			setTimeout(function(){
        				$(".con-table").show(100);
        			},100);
        		}else if(itemType == '2'){
        			$(".con-table").hide(100);
        			setTimeout(function(){
        				$(".con-line")
        				$(".con-line").show(100);
        				$("#line").show();
        			},100);
        		}
        	}
        },
        initLine: function(initData){
        	var ydata = [];
        	var VerySatisfied = [];
        	var Satisfied = [];
        	var Commonly = [];
        	var Dissatisfied = [];
        	var Complaint = [];
        	for(var i = 0; i < initData.length; i ++){
        		ydata.push(initData[i].CompanyName);
	        	VerySatisfied.push(initData[i].VerySatisfied);
	        	Satisfied.push(initData[i].Satisfied);
	        	Commonly.push(initData[i].Commonly);
	        	Dissatisfied.push(initData[i].Dissatisfied);
	        	Complaint.push(initData[i].Complaint);
        	}
        	$("#line").css({height: (ydata.length * 45 + 50) + "px"})
        	var myChart = echarts.init(document.getElementById("line"));
        	option = {
			    title: {
			        show: false
			    },
			    tooltip: {
			        trigger: 'axis',
			        axisPointer: {
			            type: 'shadow'
			        }
			    },
			    color: ['#88B6BA','#76A2C1','#E5C490','#E37755','#CB4B4F'],
			    legend: {
			    	itemWidth: 10,
			    	itemHeight: 10,
			    	right: 20,
			    	textStyle: {
			    		color: '#666'
			    	},
			        data: ['非常满意', '满意','一般','不满意','投诉']
			    },
			    grid: {
			        left: '3%',
			        right: '4%',
			        bottom: '3%',
			        containLabel: true
			    },
			    xAxis: {
			        show: false
			    },
			    yAxis: {
			    	inverse: true,
			        type: 'category',
			        axisLine: {
			        	lineStyle:{
			        		color: '#999',
			        		type: 'dashed'
			        	}
			        },
			        axisTick: {
			        	show: false
			        },
			        data: ydata
			    },
			    series: [
			        {
			            name: '非常满意',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'inside',
			            	}
			            },
			            data: VerySatisfied
			        },
			        {
			            name: '满意',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'inside',
			            	}
			            },
			            data: Satisfied
			        },
			        {
			            name: '一般',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'inside',
			            	}
			            },
			            data: Commonly
			        },
			        {
			            name: '不满意',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'inside',
			            	}
			            },
			            data: Dissatisfied
			        },
			        {
			            name: '投诉',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'inside',
			            	}
			            },
			            data: Complaint
			        }
			    ]
			};
        	myChart.setOption(option);
        	$("#line").hide();
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