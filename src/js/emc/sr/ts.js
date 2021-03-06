var mydApp = new Vue({
    el: "#mydApp",
    data: {
        reportData: {}
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    computed: {
    	totalNum: function(){
    		var totalNum = 0;
    		totalNum += (this.reportData.YEAR);
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
        	util.submitCover(true);
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetComplaintNumReport",{params:{}}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.reportData=result.data[0];
                    this.initPie1(result.data[0]);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetComplaintTypeReportPercent",{params:{}}).then(function(response){
                var result=response.data;
                if(result.status==0){
                	this.initPie2(result.data);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        toLink: function(){
        	
        },
        panelPie: function(name,myChart,colors,legs,datas){
        	option = {
			    title : {
			        show: false
			    },
			    color: colors,
			    tooltip : {
			        trigger: 'item',
			        formatter: "{a} <br/>{b} : {c} ({d}%)"
			    },
			    legend: {
			    	itemWidth: 15,
			    	itemHeight: 10,
			        x : 'center',
			        y : 'top',
			        data: legs
			    },
			    toolbox: {
			        show : false
			    },
			    calculable : true,
			    series : [
			        {
			            name: name,
			            type:'pie',
			            radius : [30, 90],
			            center : ['50%', '50%'],
			            label: {
			            	normal: {
			            		show: true,
			            		formatter: '{b}: {c}'
			            	}
			            },
			            data: datas
			        }
			    ]
			};
        	myChart.setOption(option);
        },
        initPie1: function(initData){
        	var pie1 = echarts.init(document.getElementById("pie1"));
        	var col1 = ["#67AB7E","#F04B57"];
        	var leg1 = ["已解决","未解决"];
        	var data1 = [
                {value:initData.Resolved, name:'已解决'},
                {value:initData.Unsolved, name:'未解决'}
            ];
        	this.panelPie("异常解决率",pie1,col1,leg1,data1);
        	pie1.on("click",function(params){
        		window.location.href = "tsTable.html";
        	})
        },
        initPie2: function(initData){
        	var pie2 = echarts.init(document.getElementById("pie2"));
        	var col2 = ["#6DBCC0","#008A83","#EFA596","#E9BA63","#5F91A7","#A8A9AD"];
        	var leg2 = ["进度","服务","安全","质量"];
        	var data2 = [
                {value:initData.Progress, name:'进度'},
                {value:initData.Service, name:'服务'},
                //{value:21, name:'经营'},
                {value:initData.SECURITY, name:'安全'},
                {value:initData.Quality, name:'质量'},
                //{value:12, name:'其他'}
            ];
        	this.panelPie("异常类型",pie2,col2,leg2,data2);
        },
        initPie3: function(){
        	var pie3 = echarts.init(document.getElementById("pie3"));
        	var col3 = ["#71558C","#4670A4","#FBC087","#F27D22","#4098AD","#A8A9AD"];
        	var leg3 = ["函件","APP","邮件","电话","短信","其它"];
        	var data3 = [
                {value:14, name:'函件'},
                {value:18, name:'APP'},
                {value:21, name:'邮件'},
                {value:10, name:'电话'},
                {value:25, name:'短信'},
                {value:12, name:'其他'}
            ];
        	this.panelPie("投诉方式",pie3,col3,leg3,data3);
        }
    }
});