var mydApp = new Vue({
    el: "#mydApp",
    data: {
        projectMsg:'',
        starData:[
            {"name":"质量管控","score":25,"id":1}
        ],
        state:'',
        cuAdvice:'',
        enSolution:'',
        level:[
            {Active: false},
            {Active: true},
            {checked:1}
        ],
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
            var totalStar = 0,state;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].score;
                if(this.starData[i].score==5){
                    state=0;
                    return ['#EE4727',"投诉"];
                }else if(this.starData[i].score==10){
                    state=1;
                    return ['#EE4727',"不满意"];
                }else{
                    state=2;
                }
            }
            if(state==2){
                if(totalStar>=80&&totalStar<100){
                    state=3;
                    return ['#1E8349',"满意"];
                }else if(totalStar==100){
                    state=4;
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
        this.init();
    },
    watch: {

    },
    methods: {
        init: function(){
            util.submitCover(true);
        	// $(".score li").addClass("redstar");
            // this.initPage();
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
        changeMind:function(event){
            var i = $(event.currentTarget).index();
            this.level[this.level[2].checked].Active = false;
            this.level[i].Active = true;
            this.level[2].checked = i;
        },
        submit:function(){
            util.submitCover(true);
            var SafiId = util._param.Satisfaction_Id;
            var suggestContene = $(".advice_content").val();
            var sa_type;
            if(suggestContene == ""||!suggestContene){
                if(mydApp.level[2].checked==0){
                    // util.notification.simple("我们真诚的希望您告知我们哪里做得还不够好！");
                    // return false;
                    suggestContene = "[客户不满意]";
                    sa_type = 1;
                }else{
                    suggestContene = "[客户满意]";
                    sa_type = 5;
                }
            }else{
                if(mydApp.level[2].checked==0){
                    sa_type = 1;
                }else{
                    sa_type = 5;
                }
            }
            var params={
                "pmSatisfactionSuggestions": {
                    "Satisfaction_Id": SafiId,
                    "Suggestion": suggestContene,
                    "Satisfaction_Type": sa_type
                }
            };
            // console.info(JSON.stringify(params));
            // return false;
            this.sendTwice(params,function(){
                window.location="succOne.html";
            });
        },
        getProjectMsg:function(projectId){
            var SafiId = util._param.Satisfaction_Id;
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetProjectInfo',{params:{"project_id":projectId,"satisfaction_id":SafiId}}).then(function(response){
                if(response.data.status==0){
                    if(response.data.data.approve_status == 0&&response.data.data.satisfaction_status == 5){
                        this.projectMsg = response.data.data;
                        this.getAdvice();
                    }else{
                        $("#mydApp").html("该链接已失效！");
                        $("#mydApp").addClass("shixiao");
                        return false;
                    }
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        getAdvice:function(){
            var SafiId = util._param.Satisfaction_Id; 
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetPmSatisfactionSuggestion',{params:{"satisfaction_id":SafiId}}).then(function(response){
                if(response.data.status==0){
                    this.cuAdvice = response.data.data[0].Suggestion;
                    this.enSolution = response.data.data[1].Suggestion;
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        sendTwice:function(params,callback){
            this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/Post_PmSatisfactionSuggestion',params).then(function(response){
                if(response.data.status==0){
                    callback();
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        }
    }
});
