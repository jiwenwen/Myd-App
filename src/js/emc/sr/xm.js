var mydApp = new Vue({
    el: "#mydApp",
    data: {
        reportList: []
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
    			totalNum += this.reportList[i].ProjectTotal;
    		}
    		return totalNum;
    	}
    },
    watch: {},
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
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetProjectReportList",{params:params}).then(function(response){
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
        	window.location.href = "proList.html?companyId=" + companyId + "&satisfied_Type=1&project_Type=" + project_Type;
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
        	var bmyNum = [];
        	var dcNum = [];
        	var xmNum = [];
        	for(var i = 0; i < initData.length; i ++){
        		ydata.push(initData[i].ORGNAME);
        		bmyNum.push({value: initData[i].Abnormal, id: initData[i].CompanyID});
        		dcNum.push({value: initData[i].InvestigateProject, id: initData[i].CompanyID});
        		xmNum.push({value: initData[i].ProjectTotal, id: initData[i].CompanyID});
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
			    color: ['#CB4B4F','#8AB6BA','#77A3C1'],
			    legend: {
			    	itemWidth: 10,
			    	itemHeight: 10,
			    	textStyle: {
			    		color: '#666'
			    	},
			        data: ['异常项目数', '调查项目数', '项目总数']
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
			            name: '异常项目数',
			            type: 'bar',
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: bmyNum
			        },
			        {
			            name: '调查项目数',
			            type: 'bar',
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: dcNum
			        },
			        {
			            name: '项目总数',
			            type: 'bar',
			            barWidth: 16,
			            label: {
			            	normal:{
			            		show: true,
			            		position: 'insideRight',
			            		offset: [5, 0]
			            	}
			            },
			            data: xmNum
			        }
			    ]
			};
        	myChart.setOption(option);
        	$("#line").hide();
        	myChart.on("click",function(params){
        		var project_Type = 1;
        		if(params.seriesName == "异常项目数"){
        			project_Type = 3;
        		}else if(params.seriesName == "调查项目数"){
        			project_Type = 2;
        		}else if(params.seriesName == "项目总数"){
        			project_Type = 1;
        		}
        		window.location.href = "proList.html?companyId=" + params.data.id + "&satisfied_Type=1&project_Type=" + project_Type;
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