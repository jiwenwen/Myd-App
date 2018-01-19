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
    			totalNum += (this.reportList[i].ComplaintNum);
    		}
    		return totalNum;
    	}
    },
    methods: {
        init: function () {
			this.initData();
        },
        //返回上一级
        goBack: function(){
        	window.history.back();
        },
        toLink: function(){
        	
        },
        initData: function(){
        	var startTime = localStorage.getItem("startTime");
        	var endTime = localStorage.getItem("endTime");
        	if(!startTime || !endTime || startTime > endTime){
        		return false;
        	}
        	util.submitCover(true);
        	this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetReportComplaintTotal",{params:{}}).then(function(response){
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
        //查看具体项目
        toProList: function(event){
        	var $item = $(event.currentTarget);
        	var companyId = $item.attr("cId");
        	var project_Type = $item.attr("type");
        	window.location.href = "proList.html?companyId=" + companyId + "&satisfied_Type=4&project_Type=" + project_Type;
        }
    }
});