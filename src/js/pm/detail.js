var pageInit = null;
var mydApp = new Vue({
    el: "#mydApp",
    data: {
        starData:[
            {"name":"","score":0,"id":1}
        ],
        state:'',
        fSelect: true,
        proList: [],
        evaluateList:[],
        pmSatisfaction:{
            Feedback_Time:'',
            Satisfaction_Status:'',
            Approve_Status:''
        },
        recordList:[{
            Audit_Date:''
        }],
        remainingDays:'',
        status:'',
        viewdata:[],
        displacement:'',
        s_index: 0,
        role:'',
        progress:0,
        pico:5
    },
    computed: {
        total: function(){
            var totalStar = 0;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].Score;
            }
            return totalStar;
        },
        colors:function(){
            var totalStar = 0,state;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].score;
                if(this.starData[i].score==this.pico){
                    state=0;
                    return ['#EE4727',"投诉"];
                }else if(this.starData[i].score==this.pico*2){
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
            /*判断设备*/
            /*var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            if (isiOS) {
                $("html").css("padding-top", "20px");
                $("html").css("box-sizing", "border-box");
            }*/
            /*获取权限*/
           /* this.role=localStorage.getItem("Role")?localStorage.getItem("Role"):2;
            this.status = $.cookie("status") ? $.cookie("status") : 1;
            if (this.status==1){
                $(".detail").css("bottom","4.17rem")
            }*/
            /*页面初始化数据*/
            if(util._param.status==1){
                localStorage.setItem("Role",2);
                this.role = 2;
                this.status=1;
                $(".detail").css("bottom","4.17rem");
                if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                    var token_temp = util._param.token;
                    localStorage.setItem("token", token_temp);
                    setVueHttp(token_temp);
                    this.getInfo();
                }else{
                    gm_getToken(window.GMQuality.getToken());
                    this.getInfo();
                }
            }
            else{
                this.role=localStorage.getItem("Role");
                this.status = $.cookie("status") ? $.cookie("status") : 1;
                if (this.status==1){
                    $(".detail").css("bottom","4.17rem");
                }
                this.getInfo();
            }
        },
        /*获取页面信息*/
        getInfo:function(){
            util.submitCover(true);
            var params={
                "satisfaction_id":util._param.satisId,
                "project_id":util._param.pjId
            };
            this.$http.get( util.baseUrl + "PMSatisfactionsAPI/GetPmSatisfactionDetailed",{params:params}).then(function(response){
                var result=response.data;
                if(result.status==0){
                    var evalue = result.data.Evaluate_List;
                    var len = evalue.length;
                    this.pico = 20/len;
                    this.pmSatisfaction=result.data.Pm_Satisfaction;
                    this.recordList=result.data.Satisfaction_Pmc_List;
                    this.remainingDays=result.data.Remaining_Days;
                    var tempData = [];
                    for (var i=0;i<len;i++){
                        tempData.push({"name":evalue[i].Type_Name,"Score":evalue[i].Score,"Evaluate_Id":i});
                        // this.evaluateList[i].Evaluate_Id=i;
                    }
                    this.starData=tempData;
                }
                else{
                    util.notification.simple(result.msg);
                }
                $(".loading").hide();
                util.submitCover(false);
            }, function(response){
                errorFun(response,util);
                util.submitCover(false);
                util.notification.simple("网络连接异常");
                $(".loading").hide();
            });
        },
        //评分效果
        lightStar:function(event){
            var maintype = parseInt($(event.currentTarget).attr("type"))-1;
            var index = parseInt($(event.currentTarget).attr("index"));
            mydApp.starData[maintype].score = index*5;
        },
        goBack:function(){
            window.location.href="list.html?satisId="+util._param.satisId+"&pjId="+util._param.pjId;
        },
        submit:function(){
            if($(".form-content").find("textarea").val()){
                util.submitCover(true);
                $(".loading").show();
                var params={
                    "Pm_Satisfaction": {
                        "Satisfaction_Id":util._param.satisId,
                        "Satisfaction_Code": 0,
                        "satisfaction_Status":this.pmSatisfaction.Satisfaction_Status,
                        "approve_Status":3,
                        "Project_Id": util._param.pjId,
                        "Affirm_Info": 0,
                        "Progress_Info": 0,
                        "Visitor": 0,
                        "Progress": 0,
                        "Suggestion": 0
                    },
                    "satisfaction_Dept": {
                        "Satisfaction_Id": util._param.satisId,
                        "Review_User": 0,
                        "Resolve_Desc": $(".form-content").find("textarea").val()
                    }
                };
                this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/PostManagementReply',params).then(function(response){
                    var result=response.data;
                    if(result.status==0){
                        util.notification.simple(result.msg);
                        setTimeout(function(){
                            history.back();
                        },2000);
                    }
                    else{
                        util.notification.simple(result.msg);
                    }
                    $(".loading").hide();
                    util.submitCover(false);
                },function(response){
                    errorFun(response,util);
                    util.submitCover(false);
                    $(".loading").hide();
                });
            }
            else{
                util.notification.simple("解决措施必填！");
            }
        },
        /*图片预览滑动*/
        imgChange:function(event){
            for (var i=0;i<$(event.currentTarget).parent().find("img").length;i++){
                var $imgurl=$($(event.currentTarget).parent().find("img")[i]).attr("src");
                this.viewdata.push({"path":$imgurl});
            }

            var basewidth = parseInt($(".view").width());
            mydApp.s_index = $(event.currentTarget).index();
            var displacement = (-1*mydApp.s_index*100);
            mydApp.displacement = displacement;
            $(".view").show(100);
            setTimeout(function () {
                var pressedObj;  // 当前左滑的对象
                var lastLeftObj; // 上一个左滑的对象

                for (var i = 0; i < $(".touch").length; i++) {
                    $(".touch")[i].addEventListener("touchstart", function (e) {
                        lastXForMobile = e.changedTouches[0].pageX;
                        pressedObj = this; // 记录被按下的对象
                        // 记录开始按下时的点
                        var touches = e.touches[0];
                        start = {
                            x: touches.pageX, // 横坐标
                            y: touches.pageY  // 纵坐标
                        };
                    });
                    $(".touch")[i].addEventListener("touchmove", function (e) {
                        // 计算划动过程中x和y的变化量
                        var touches = e.touches[0];
                        delta = {
                            x: touches.pageX - start.x,
                            y: touches.pageY - start.y
                        };
                        // 横向位移大于纵向位移，阻止纵向滚动
                        if (Math.abs(delta.x) > Math.abs(delta.y)) {
                            e.preventDefault();
                        }
                    });
                    $(".touch")[i].addEventListener('touchend', function (e) {
                        var diffX = e.changedTouches[0].pageX - lastXForMobile;
                        if (diffX < -45 && mydApp.s_index < $(".touch").length - 1) {
                            mydApp.displacement = mydApp.displacement - 100;
                            mydApp.s_index = mydApp.s_index + 1;
                        } else if (diffX > 45 && mydApp.s_index > 0) {
                            mydApp.displacement = mydApp.displacement + 100;
                            mydApp.s_index = mydApp.s_index - 1;
                        }
                    });
                }
            }, 100);
        },
        hideImg:function(){
            $(".view").hide();
            this.viewdata=[];
        }
    }
});