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
    			totalNum += (this.reportList[i].Three + this.reportList[i].ThreeorFive + this.reportList[i].Five);
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
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetDelayReportList",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.reportList=result.data;
                    this.initLine(result.data);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        //查看具体项目
        toProList: function(event){
        	var $item = $(event.currentTarget);
        	var companyId = $item.attr("cId");
        	var project_Type = $item.attr("type");
        	window.location.href = "proList.html?companyId=" + companyId + "&satisfied_Type=2&project_Type=" + project_Type;
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
        	var three = [];
        	var threeorFive = [];
        	var five = [];
        	for(var i = 0; i < initData.length; i ++){
        		ydata.push(initData[i].ORGNAME);
	        	three.push({value: initData[i].Three, id: initData[i].CompanyID});
	        	threeorFive.push({value: initData[i].ThreeorFive, id: initData[i].CompanyID});
	        	five.push({value: initData[i].Five, id: initData[i].CompanyID});
        	}
        	$("#line").css({height: (ydata.length * 80 + 50) + "px"})
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
			    color: ['#F1C230','#ED8738','#F04B57'],
			    legend: {
			    	itemWidth: 10,
			    	itemHeight: 10,
			    	right: 20,
			    	textStyle: {
			    		color: '#666'
			    	},
			        data: ['3天内', '3-5天','5天及以上']
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
			            name: '3天内',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: three
			        },
			        {
			            name: '3-5天',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: threeorFive
			        },
			        {
			            name: '5天及以上',
			            type: 'bar',
			            stack: 1,
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: five
			        }
			    ]
			};
        	myChart.setOption(option);
        	$("#line").hide();
        	myChart.on("click",function(params){
        		var project_Type = 1;
        		if(params.seriesName == "3天内"){
        			project_Type = 1;
        		}else if(params.seriesName == "3-5天"){
        			project_Type = 2;
        		}else if(params.seriesName == "5天及以上"){
        			project_Type = 3;
        		}
        		window.location.href = "proList.html?companyId=" + params.data.id + "&satisfied_Type=2&project_Type=" + project_Type;
        	});
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