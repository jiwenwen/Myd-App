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
    		var sdNum = 0;
    		for(var i = 0; i < this.reportList.length; i ++){
    			sdNum += this.reportList[i].ManualClose;
    		}
    		return sdNum;
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
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetManualCloseReportList",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    this.reportList=result.data;
                    this.initPie(result.data);
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
        initPie: function(initData){
        	var sdgb = 0;
        	var clz = 0;
        	var zdgb = 0;
        	for(var i = 0; i < initData.length; i ++){
        		sdgb += initData[i].ManualClose;
        		clz += initData[i].Handling;
        		zdgb += initData[i].AutoClose;
        	}
        	var pie1 = echarts.init(document.getElementById("pie1"));
        	var col1 = ["#548EBA","#EFB587","#69B1C2"];
        	var leg1 = ["手动关闭","处理中","自动关闭"];
        	var data1 = [
                {value:sdgb, name:'手动关闭'},
                {value:clz, name:'处理中'},
                {value:zdgb, name:'自动关闭'}
            ];
        	this.panelPie("关闭方式",pie1,col1,leg1,data1);
        }
    }
});