var mydApp = new Vue({
    el: "#mydApp",
    data: {
    	starData:[
            {"Type_Name":"质量管控","score":0,"Type_Id":1}
        ],
        dcInfo: {
        	
        },
        proIndex: 0,
        searchItem: "",
        proScroll: true,
        state:'',
       	fSelect: true,
        proList: [],
        projectPersonnelInfo: {
        	SysParameterses: [{
        		Type_Name: ""
        	}]
        },
        progress:0,
        multiple:0
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    watch: {},
    methods: {
        init: function () {
        	if(util._param.pjId){
        		this.initPro(util._param.pjId);
        	}
            /*监控手机enter*/
            $(".header-search").on("keydown", "input", function (event) {
                if (event.keyCode == 13) {
                	mydApp.searchPj();
                }
            });
        },
        //点击+按钮
        submitProblem: function () {
            window.reload();
        },
        //显示搜索
        showSearch: function () {
            $(".slider-select .header-left").hide();
            $(".slider-select .header-middle").hide();
            $(".slider-select .header-right").hide();
            $(".slider-select .header-search").show();
        },
        //点击取消搜索按钮
        cancelSearch: function () {
            $(".slider-select .header-left").show();
            $(".slider-select .header-middle").show();
            $(".slider-select .header-right").show();
            $(".slider-select .header-search").hide();
        },
        //点击退出按钮
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
        //退出
        out: function () {
            var confirm = util.notification.confirm("确定要退出吗？", function (e, type) {
                if (type == true) {
                    //弹出提示框
                    if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                        logOut();
                    } else {
                        window.GMQuality.logOut();
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
        //获取项目列表
        getProList: function(){
        	util.submitCover(true);
        	var params = {
        		searchEntity:{
        			pageIndex: this.proIndex,
        			pageSize: 20
        		}
        	};
        	if(this.searchItem != ""){
        		params.searchEntity.commonSearchCondition = this.searchItem;
        	}
        	if(this.proIndex == 0){
        		this.proList = [];
        	}
        	this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetProjectList",{params: params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                	this.fSelect = false;
                	this.proList = this.proList.concat(result.data);
                	if(result.data.length >= 20){
                		this.proScroll = true;
                	}
                }else{
                    util.notification.simple(result.msg);
                    this.proScroll = true;
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
                this.proScroll = true;
            });
        },
        showSelect: function(){
        	if(util._param.pjId){
        		return false;
        	}
            if(this.fSelect){
            	this.getProList();
            	$(".slider-select .detail").on("scroll",function(){
        			var top = $(this).scrollTop();
            		var height = $(this).height();
            		var sheight = $(this).find(".pro-ul").height();
            		if((top + height + 20) >= sheight){
            			if(mydApp.proScroll){
            				mydApp.proScroll = false;
            				mydApp.getProList(++ mydApp.proIndex);
            			}
            		}
            	});
            }
            if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
               	$(".slider-select").css({'top': '0'});
               	$(".slider-select .detail").css({'bottom': '0px'});
            } else {
                $(".slider-select").css({'top': '0'});
                $(".slider-select .detail").css({'bottom': '0px'});
            }
        },
        hideSelect: function(){
        	$(".slider-select").css({'top': '100%'});
        },
        //关闭当前页返回上一页
        backHistory: function(){
        	window.history.back();
        },
        //初始化项目信息
        initPro: function(proId){
        	//调用接口查出带出信息
			util.submitCover(true);
            var params = {
                "searchEntity":{
                    "project_Id":proId
                },
                "satisfaction_id":util._param.satisId?util._param.satisId:0
            };
        	this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetProjectPersonnelInfo",{params: params}).then(function(response){
                var result=response.data;
                var progress = result.data.pm_progress;
                if(result.status==0){
                	if(result.data){
                		this.projectPersonnelInfo = result.data;
                		this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetParameters?progress="+progress).then(function(response){
			                var result=response.data;
			                if(result.status==0){
			                	var starTmp = [];
                                this.multiple = 4/result.data.length;
			                	for(var i = 0; i < result.data.length; i ++){
			                		result.data[i]["score"] = 0;
			                	}
			                	this.starData = result.data;
			                }
			                else{
			                    util.notification.simple(result.msg);
			                }
			                util.submitCover(false);
			            }, function(response){
			                errorFun(response,util);
			                util.submitCover(false);
			            });
                	}else{
                		this.projectPersonnelInfo = {
				        	SysParameterses: [{
				        		Type_Name: ""
				        	}]
				        };
				        util.notification.simple("改项目暂无相关信息，请重新选择");
				        util.submitCover(false);
                	}
                }
                else{
                	util.submitCover(false);
                    util.notification.simple(result.msg);
                }
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
			$(".term-empty").hide();
			$(".term-star").show();
			$(".term-msg").show();
			$(".footer").show();
			$(".close-page").show();
			$(".opts .opts-right").hide();
			$(".opts .opts-left").css({width: '100%'});
        	this.hideSelect();
        },
        //选择某一个项目
        choosePro: function(event){
        	var $item = $(event.currentTarget);
        	var proId = $item.attr("proId");
        	//调用接口查出带出信息
			util.submitCover(true);
        	this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetProjectPersonnelInfo",{params: {searchEntity: {project_Id: proId}}}).then(function(response){
                var result=response.data;
                var progress = result.data.pm_progress;
                if(result.status==0){
                	if(result.data){
                		this.projectPersonnelInfo = result.data;
                		this.$http.get(util.baseUrl + "PMSatisfactionsAPI/GetParameters?progress="+progress).then(function(response){
			                var result=response.data;
			                if(result.status==0){
			                	var starTmp = [];
                                this.multiple = 4/result.data.length;
                                // console.log(this.multiple);
			                	for(var i = 0; i < result.data.length; i ++){
			                		result.data[i]["score"] = 0;
			                	}
			                	this.starData = result.data;
			                }
			                else{
			                    util.notification.simple(result.msg);
			                }
			                util.submitCover(false);
			            }, function(response){
			                errorFun(response,util);
			                util.submitCover(false);
			            });
                	}else{
                		this.projectPersonnelInfo = {
				        	SysParameterses: [{
				        		Type_Name: ""
				        	}]
				        };
				        util.notification.simple("改项目暂无相关信息，请重新选择");
				        util.submitCover(false);
                	}
                }
                else{
                	util.submitCover(false);
                    util.notification.simple(result.msg);
                }
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
			$(".term-empty").hide();
			$(".term-star").show();
			$(".term-msg").show();
			$(".footer").show();
			$(".close-page").show();
        	this.hideSelect();
        },
        //搜索
        searchPj: function () {
       		var searchItem = $("input[name='searchKey']").val();
        	if(searchItem.trim() != ""){
        		this.searchItem = searchItem.trim();
        		this.proIndex = 0;
       			this.proScroll = true;
        		this.getProList();
        	}
        },
        //删除搜索条件
        searchDelete: function () {
            $("input[name='searchKey']").val("");
            this.searchItem = "";
    		this.pageIndex = 0;
   			this.proScroll = true;
    		this.getProList();
        },
        //评分效果
        lightStar:function(event){
            var maintype = parseInt($(event.currentTarget).attr("type"));
            var index = parseInt($(event.currentTarget).attr("index"));
            for(var i = 0; i < this.starData.length; i ++){
            	if(this.starData[i]["Type_Id"] == maintype){
            		this.starData[i].score = index*5;
            	}
            }
        },
        //发起线下调查
        addAI: function(params){
            console.log(params);
        	util.submitCover(true);
        	this.$http.post(util.baseUrl + "PMSatisfactionsAPI/Post_SatisfactionEvaluate",params).then(function(response){
                var result=response.data;
                if(result.status==0){
					util.notification.simple("提交成功");
					if(util._param.satisId){
						setTimeout(function(){
							window.location.href = "list.html?status=1&pjId=" + util._param.pjId;
						},2000);
					}else{
						setTimeout(function(){
							window.location.reload();
						},2000);
					}
                }
                else{
                    util.notification.simple(result.msg);
                }
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        //线下调查
        completeAI: function(){
        	var proId = this.projectPersonnelInfo.project_id,
				proName = this.projectPersonnelInfo.project_name,
				contactPerson = this.projectPersonnelInfo.contact_person,
				mobile = this.projectPersonnelInfo.contact_tel,
				progress = this.projectPersonnelInfo.pm_progress,
				msg = $("textarea[name='msg']").val().trim();
			var typeId = "";
			if(this.projectPersonnelInfo.SysParameterses.length > 0){
				typeId = this.projectPersonnelInfo.SysParameterses[0].Type_Id;
			}
			if(!proId || !proName || !mobile){
				util.notification.simple("请选择需要调查的项目");
				return false;
			}
			var params = {
				"PmSatisfactionEvaluates": [],
				"PmSatisfaction": {
					"Satisfaction_Id": 0,
					"Satisfaction_Code": "string",
					"Affirm_Info": 0,
					"Progress_Info": 0,
					"Visitor": 0,
					"Project_Id": proId,
					"Receptionist": contactPerson,
					"Tel": mobile,
					"Progress": progress,
					"Result": "0",
					"Approve_Status": 4,
					"Suggestion": msg,
					"Source_Type": 3,
					"Satisfaction_Status": 1
				}
			};
			var totalScore = 0;
			for(var i = 0; i < mydApp.starData.length; i ++){
				if(mydApp.starData[i]["score"] <= 0){
					util.notification.simple("请给" + mydApp.starData[i]["Type_Name"] + "项打分");
					return false;
				}
				params["PmSatisfactionEvaluates"].push({
				    "Evaluate_Id": 0,
				    "Satisfaction_Id": 0,
				    "Satisfaction_Type": mydApp.starData[i]["Type_Id"],
				    "Score": mydApp.starData[i]["score"]*this.multiple
				});
				totalScore += parseInt(mydApp.starData[i]["score"]*this.multiple);
				if(mydApp.starData[i]["score"] <= 10){
					params["PmSatisfaction"]["Approve_Status"] = 1;
					params["PmSatisfaction"]["Satisfaction_Status"] = 2;
				}
			}
			/*if(msg == ""){
				util.notification.simple("请填写改进建议或意见");
				return false;
			}*/
			if(util._param.satisId){
				params["PmSatisfaction"]["Satisfaction_Id"] = util._param.satisId;
			}
    		var confirm = util.notification.confirm("确定调查结果?", function(e, type) {
				if (type == true) {
					params["PmSatisfaction"]["Result"] = totalScore;
					mydApp.addAI(params);
					confirm.hide();
				}else{
					confirm.hide();
				}
			});
			confirm.show();
        },
        //线上调查
		sendAI: function(){
			var proId = this.projectPersonnelInfo.project_id,
				proName = this.projectPersonnelInfo.project_name,
				contactPerson = this.projectPersonnelInfo.contact_person ? this.projectPersonnelInfo.contact_person : "",
				mobile = this.projectPersonnelInfo.contact_tel,
				progress = this.projectPersonnelInfo.pm_progress;
			var typeId = "";
			if(this.projectPersonnelInfo.SysParameterses.length > 0){
				typeId = this.projectPersonnelInfo.SysParameterses[0].Type_Id;
			}
			if(!proId || !proName){
				util.notification.simple("请选择需要调查的项目");
				return false;
			}else if(!mobile){
				util.notification.simple("该项目暂无可调查人员");
				return false;
			}
    		var confirm = util.notification.confirm("确定发起?",function(e, type) {
				if (type == true) {
					var params = {
							"project_id": proId
					};
					util.submitCover(true);
		        	mydApp.$http.get(util.baseUrl + "PMSatisfactionsAPI/SendInvestigation",{params: params}).then(function(response){
		                var result=response.data;
		                if(result.status==0){
							util.notification.simple("已发送");
							setTimeout(function(){
								window.location.reload();
							},2000);
		                }
		                else{
		                    util.notification.simple(result.msg);
		                }
		                util.submitCover(false);
		            }, function(response){
		                errorFun(response,util);
		                util.submitCover(false);
		            });
					confirm.hide();
				}else{
					confirm.hide();
				}
			},"" + proName + "<span class='org-color'>的满意度调查</span>，发送至客户<span class='org-color'>" + contactPerson + "</span>。");
			confirm.show();
		}
    }
});