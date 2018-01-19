var mydApp = new Vue({
    el: "#mydApp",
    data: {
        reportData: {},
        reportList: []
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    computed: {
    	byxNum: function(){
    		var byxNum = 0;
    		for(var i = 0; i < this.reportList.length; i ++){
    			byxNum += this.reportList[i].CommendLetter;
    		}
    		return byxNum;
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
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetPraiseNumReport",{params:{}}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.reportData=result.data;
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetPraiseTypeReportPercent",{params:{}}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.initPie(result.data);
                }else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetReportPraiseTotal",{params:{}}).then(function(response){
                var result=response.data;
                if(result.status==0){
                	this.reportList=result.data;
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
        //查看具体项目
        toProList: function(event){
        	var $item = $(event.currentTarget);
        	var companyId = $item.attr("cId");
        	var project_Type = $item.attr("type");
        	window.location.href = "proList.html?companyId=" + companyId + "&satisfied_Type=3&project_Type=" + project_Type;
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
			            roseType : 'area',
			            data: datas
			        }
			    ]
			};
        	myChart.setOption(option);
        },
        initPie: function(initData){
        	var pie1 = echarts.init(document.getElementById("pie1"));
        	var col1 = ["#6DBCC0","#008A83","#EFA596","#E9BA63","#5F91A7","#A8A9AD"];
        	var leg1 = ["进度","服务","安全","质量"];
        	var data1 = [
                {value:initData.Progress, name:'进度'},
                {value:initData.Service, name:'服务'},
                //{value:21, name:'经营'},
                {value:initData.SECURITY, name:'安全'},
                {value:initData.Quality, name:'质量'},
                //{value:12, name:'其他'},
            ];
        	this.panelPie("表扬类型",pie1,col1,leg1,data1);
        }
    }
});