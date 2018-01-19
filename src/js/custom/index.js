var mydApp = new Vue({
    el: "#mydApp",
    data: {
        projectMsg:'',
        starData:[
            {"name":"质量管控","score":0,"id":1}
        ],
        state:4,
        progress:0,
        pico:5
    },
    computed: {
        total: function(){
            var totalStar = 0;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].score;
            }
            return totalStar;
        },
        colors:function(){
            var totalStar = 0;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].score;
                if(this.starData[i].score==this.pico){
                    this.state=0;
                    return ['#EE4727',"投诉"];
                }else if(this.starData[i].score==(this.pico*2)){
                    this.state=1;
                    return ['#EE4727',"不满意"];
                }else{
                    this.state=2;
                }
            }
            if(this.state==2){
                if(totalStar==0){
                    return ['#000000',""];
                }else if(totalStar>=80&&totalStar<100){
                    this.state=3;
                    return ['#1E8349',"满意"];
                }else if(totalStar==100){
                    this.state=4;
                    return ['#1E8349',"非常满意"];
                }else{
                    return ['#EDA938',"一般"];
                }
            }
        }
    },
    created: function(){

    },
    mounted: function(){
        count=1;
        this.init();
    },
    watch: {

    },
    methods: {
        init: function(){
            util.submitCover(true);
        	$(".score li").addClass("redstar");
            this.initPage();
            if(util._param.project_id){
                var projectId = util._param.project_id;
                this.getProjectMsg(projectId);
            }
        },
        initPage:function(){
            /*判断设备*/
			var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
			/*if(isiOS){
				$("html").css("padding-top","20px");
				$("html").css("box-sizing","border-box");
			}*/
        },
        submit:function(){
            util.submitCover(true);
            var SafiId = util._param.Satisfaction_Id;
            var fours = mydApp.starData;
            var totalScore=0;
            var suggestContene = $(".advice_content").val();
            if(suggestContene == ""||!suggestContene){
                if(mydApp.state<2){
                    suggestContene = "[客户不满意]";
                }else{
                    suggestContene = "[客户满意]";
                }
            }
            var params={
                "PmSatisfactionEvaluates": [],
                "PmSatisfaction": {
                    "Satisfaction_Id": SafiId,
                    "Satisfaction_Code": 0,
                    "Affirm_Info": 0,
                    "Progress_Info": 0,
                    "Visitor": 0, 
                    "Progress": 0,
                    "Result": "",
                    "Approve_Status": 4,
                    "Suggestion": suggestContene,
                    "Satisfaction_Status": 1,
                    "Progress":this.progress
                },
                "PmSatisfactionSuggestion": {
                    "Satisfaction_Id": SafiId,
                    "Suggestion": suggestContene,
                    "Satisfaction_Type": this.state+1
                }
            };
            for(var i=0;i<fours.length;i++){
                if(fours[i].score == 0){
                    util.submitCover(false);
                    util.notification.simple(this.starData[i].name+"未打分");
                    return false;
                }
                totalScore=totalScore+fours[i].score;
                params["PmSatisfactionEvaluates"].push({"Satisfaction_Id":SafiId,"Satisfaction_Type":fours[i].Type_Id,"Score":fours[i].score});
            }
            params["PmSatisfaction"]["Result"] = totalScore;
            if(mydApp.state==0||mydApp.state==1){
                params["PmSatisfaction"]["Approve_Status"] = 1;
                params["PmSatisfaction"]["Satisfaction_Status"] = 2;
            }else{
                params["PmSatisfaction"]["Approve_Status"] = 4;
                params["PmSatisfaction"]["Satisfaction_Status"] = 1;
            }
            console.info(JSON.stringify(params));
            // return false;
            this.submitScore(params,function(){
                if(mydApp.state==0||mydApp.state==1){
                    window.location="succOne.html";
                }else{
                    window.location="succTwo.html";
                }
            });
        },
        lightStar:function(event){
            var maintype = parseInt($(event.currentTarget).attr("type"))-1;
            var index = parseInt($(event.currentTarget).attr("index"));
            mydApp.starData[maintype].score = index*this.pico;
        },
        getProjectMsg:function(projectId){
            var SafiId = util._param.Satisfaction_Id;
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetProjectInfo',{params:{"project_id":projectId,"satisfaction_id":SafiId}}).then(function(response){
                if(response.data.status==0){
                    if(response.data.data.approve_status == 0&&response.data.data.satisfaction_status == 4){
                        this.projectMsg = response.data.data;
                        this.progress = response.data.data.progress;
                        this.getScoreType();
                    }else{
                        $("#mydApp").html("该链接已失效！");
                        $("#mydApp").addClass("shixiao");
                        util.submitCover(false);
                        return false;
                    }
                }
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        getScoreType:function(){
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetParameters?progress='+this.progress).then(function(response){
                if(response.data.status==0){
                    console.info(response.data);
                    var len = response.data.data.length;
                    // var len = 2;
                    this.pico = 20/len;
                    this.starData = [];
                    for(var i = 0;i<len;i++){
                        this.starData.push({"name":response.data.data[i].Type_Name,"score":0,"id":response.data.data[i].Order_Id,"Type_Id":response.data.data[i].Type_Id});
                    }
                    console.info(this.starData);
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        submitScore:function(params,callback){
            console.info(params);
            this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/Post_CustomerEvaluate',params).then(function(response){
                if(response.data.status==0){
                    callback();
                }else if(response.data.status==1){
                    util.notification.simple(response.data.msg);
                    setTimeout(function(){
                        window.location.reload();
                    },2000);
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        }
    }
});
