var mydApp = new Vue({
    el: "#mydApp",
    data: {
    	sItem: "",
    	cType: 2,
    	scrollFlag: true,
    	PageIndex: 0,
    	totalNum: 0,
    	managerList: [],
    	managerDetail: {}
    },
    created: function () {
		
    },
    mounted: function () {
        this.init();
    },
    methods: {
        init: function () {
            /*监控手机enter*/
           	this.getList();
            $(".search").on("keydown", "input", function (event) {
                if(event.keyCode == 13) {
                    mydApp.sItem = $(this).val();
                    mydApp.PageIndex = 0;
                    mydApp.scrollFlag = true;
                    mydApp.getList();
                }
            });
            $(".c-right .list").on("scroll",function(){
            	if(mydApp.scrollFlag){
	            	var scrollTop = $(this).scrollTop();
	            	var sHeight = $(this).height();
	            	var cHeight = $(this).find("ul").height();
	            	if((scrollTop + sHeight + 20) > cHeight){
	            		mydApp.scrollFlag = false;
	            		mydApp.PageIndex ++;
	            		mydApp.getList();
	            	}
            	}
            });
        },
        changeTap: function(event){
        	var $item = $(event.currentTarget);
        	if(!$item.hasClass("active")){
        		$(".c-left ul li.active").removeClass("active");
        		$item.addClass("active");
        		this.cType = $item.attr("cType");
        		mydApp.PageIndex = 0;
                mydApp.scrollFlag = true;
                mydApp.getList();
        	}
        },
        getList: function(){
        	util.submitCover(true);
        	var params = {
        		searchEntity: {
        			PageIndex: this.PageIndex,
        			PageSize: 20
        		}
        	}
        	if(this.sItem){
        		params.searchEntity.manager = this.sItem
        	}
        	if(this.cType == 2){
        		this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetManagerQueryList",{params:params}).then(function(response){
	                var result=response.data;
	                if(result.status==0){
	                	if(this.PageIndex == 0){
	                		this.managerList=result.data.PmSatisfactionQueryList;
	                		this.totalNum = result.data.Total
	                	}else{
	                		this.managerList= this.managerList.concat(result.data.PmSatisfactionQueryList);
	                	}
	                }else{
	                    util.notification.simple(result.msg);
	                }
	                util.submitCover(false);
	                if(result.data.PmSatisfactionQueryList && result.data.PmSatisfactionQueryList.length >= 20){
	                	mydApp.scrollFlag = true;
	                }
	            }, function(response){
	                errorFun(response,util);
	                util.submitCover(false);
	                mydApp.scrollFlag = true;
	            });
        	}
        },
        getDetail: function(event){
        	var $item = $(event.currentTarget);
        	util.submitCover(true);
        	if($item.attr("itemId")){
        		var params = {
	        		searchEntity: {
	        			"user_id": 6018
	        		}
	        	}
	    		this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetManageReportList",{params:params}).then(function(response){
	                var result=response.data;
	                if(result.status==0){
                		this.managerDetail = result.data[0];
                		$(".show-detail").show();
	                }else{
	                    util.notification.simple(result.msg);
	                }
	                util.submitCover(false);
	            }, function(response){
	                errorFun(response,util);
	                util.submitCover(false);
	            });
        	}
        },
        closeShow: function(){
        	$(".show-detail").hide();
        },
        //返回上一级
        goBack: function(){
        	window.history.back();
        }
    }
});