var mydApp = new Vue({
    el: "#mydApp",
    data: {
        role:localStorage.getItem("Role"),
        status:'',
        rawData:{
            'Attachments':[],
            'Pm_Satisfaction':{
                'Approve_Status':0,
                'Create_Date':'',
                'Feedback_Time':''
            },
            "Satisfaction_Pmc_List":[]
        },
        button_status:0,
        closeReason:'',
        level:[
            {Active: false},
            {Active: false},
            {Active: true},
            {checked:2}
        ],
        starData:[
            {"name":"质量管控","score":25,"id":1}
        ],
        state:'',
        customSuggest:'',
        content:[{'name':'','tel':'1'}],
        closeTime:'',
        ImgUrls:[],
        progress:0,
        pico:5,
        Imgs:[],
        viewImg:[],
        displacement: ""
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
    beforeMount:function(){
        util.submitCover(true);
    },
    updated: function(){
        
    },
    filters:{
        timeFormate1:function(value){
            return value.substring(5,10);
        },
        timeFormate2:function(value){
            console.info(value);
            return value.substring(0,10);
        }
    },
    watch: {

    },
    methods: {
        init: function(){
            $(".content").on("click",".choose-photo",function(){
                var num = $(".updatePhoto img").length;
                // alert(1);
//              调用移动端方法
                if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                    openGallery(num+6);
                }else{
                    window.GMQuality.openGallery(num+6);
                }
            });
            //初始化时间
            var fun_date = function(aa){
                var date1 = new Date(),
                    time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
                var date2 = new Date(date1);
                date2.setDate(date1.getDate()+aa);
                var month = date2.getMonth() + 1;
                var strDate = date2.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var time2 = date2.getFullYear()+"-"+ month+"-"+strDate;
                return time2;
            };
            var deadline = fun_date(0);
            this.closeTime = deadline;
            this.initDate();
            if(util._param.status){
                localStorage.setItem("Role",1);
                this.role = 1;
                if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                    var token_temp = util._param.token;
                    localStorage.setItem("token", token_temp);
                    setVueHttp(token_temp);
                    this.getData();
                }else{
                    gm_getToken(window.GMQuality.getToken());
                    this.getData();
                }
                this.role = 1;
                this.status = 2;
            }else{
                this.status = $.cookie("status")?$.cookie("status"):2;
                this.getData();
            }
            // 取消预览图片
            $(".view").on("click","div",function(){
                $(".view").hide();
                mydApp.viewImg=[];
            });
        },
        initDate: function(){
            var currYear = (new Date()).getFullYear();
            var opt = {};
            opt.date = {
                preset: 'date'
            };
            opt.datetime = {
                preset: 'datetime'
            };
            opt.time = {
                preset: 'time'
            };
            opt.default = {
                theme: 'android-ics light', //皮肤样式
                display: 'modal', //显示方式 
                mode: 'scroller', //日期选择模式
                dateFormat: 'yyyy-mm-dd',
                lang: 'zh',
                showNow: true,
                nowText: "今天",
                startYear: currYear - 10, //开始年份
                endYear: currYear //结束年份
            };
            $(".closeTime1").mobiscroll($.extend(opt['date'], opt['default']));
            // $(".closeTime2").mobiscroll($.extend(opt['date'], opt['default']));
        },
        deletePic:function(event){
            var index = $(event.currentTarget).parent().index();
            mydApp.Imgs.splice(index,1);
            mydApp.ImgUrls.splice(index,1);
        },
        viewImgs:function(event){
            var basewidth = parseInt($(".view").width());
            for (var i=0;i<$(event.currentTarget).parent().find("img").length;i++){
                var $imgurl=$($(event.currentTarget).parent().find("img")[i]).attr("src");
                mydApp.viewImg.push({"Doc_Path":$imgurl});
            }
//          mydApp.viewImg=mydApp.Imgs;
            var index = $(event.currentTarget).index();
            // console.info(index);
            var displacement = (-1*index*100);
            mydApp.displacement = displacement;
            $(".view").show();
            setTimeout(function(){
                var pressedObj;  // 当前左滑的对象
                var lastLeftObj; // 上一个左滑的对象
                for(var i=0;i<$(".touch").length;i++){
                    $(".touch")[i].addEventListener("touchstart",function(e){
                        lastXForMobile = e.changedTouches[0].pageX;
                        pressedObj = this; // 记录被按下的对象
                        // 记录开始按下时的点
                        var touches = e.touches[0];
                        start = {
                            x: touches.pageX, // 横坐标
                            y: touches.pageY  // 纵坐标
                        };
                    });
                    $(".touch")[i].addEventListener("touchmove",function(e){
                        // 计算划动过程中x和y的变化量
                        var touches = e.touches[0];
                        delta = {
                            x: touches.pageX - start.x,
                            y: touches.pageY - start.y
                        };
                        // 横向位移大于纵向位移，阻止纵向滚动
                        if (Math.abs(delta.x) > Math.abs(delta.y)) {
                            event.preventDefault();
                        }
                    });
                    $(".touch")[i].addEventListener('touchend', function(e){
                        var diffX = e.changedTouches[0].pageX - lastXForMobile;
                        if (diffX < -45&&index<$(".touch").length-1) {
                            mydApp.displacement=mydApp.displacement-100;
                            index=index+1;
                        } else if (diffX > 45&&index>0) {
                            mydApp.displacement=mydApp.displacement+100;
                            index=index-1;
                        }
                    });
                }
            },50);
        },
        goBack:function(){//返回
            history.back();
        },
        submitAc:function(){//点击提交按钮
            var suggestion = $(".note>textarea").val();
            if(suggestion==""||!suggestion){
                util.notification.simple("请填写处理建议！");
                /*setTimeout(function(){
                    mydApp.cancelPop();
                },1900);*/
                return false;
            }
            $(".bg").show();
            $(".pop_window").show(10,function(){
                $(".pop_window").css({top:"33%"});
            });
        },
        forceClose:function(){//点击闭环按钮
            var suggestion = $(".note>textarea").val();
            if(suggestion==""||!suggestion){
                util.notification.simple("请说明关闭理由！");
                setTimeout(function(){
                    mydApp.cancelPop1();
                },1900);
                return false;
            }
            var pmL = this.rawData.Satisfaction_Pmc_List.length;
            this.closeReason = $(".note>textarea").val();
            $(".bg").show();
            $(".pop_window1").show(10,function(){
                $(".pop_window1").css({top:"33%"});
            });
        },
        cancelPop:function(){//提交确认弹窗点击取消
            $(".pop_window").css({top:"100%"});
            setTimeout(function(){
                $(".bg").hide();
                $(".pop_window").hide();
            },300);
        },
        cancelPop1:function(){//闭环选择弹窗点击关闭
            $(".pop_window1").css({top:"100%"});
            setTimeout(function(){
                $(".bg").hide();
                $(".pop_window1").hide();
            },300);
        },
        closeForce:function(){//闭环选择不发短信强制闭环
            util.submitCover(true);
            var satisId = util._param.satisId;
            var sst = this.rawData.Pm_Satisfaction.Satisfaction_Status,ast = this.rawData.Pm_Satisfaction.Approve_Status,params;
            var suggestion = $(".note>textarea").val();
            if(sst == 2){
                if(ast == 1){
                    ast = 7;
                }else{
                    ast = 6;
                }
            }else{
                ast = 6;
            }
            var closeTime = $(".closeTime1").val();
            var params;
            var Attachments = this.ImgUrls;
            var aL = Attachments.length;
            if(aL>0){
                for(var i = 0;i<aL;i++){
                    Attachments[i].Bill_Id = satisId;
                    Attachments[i].Expand = "APP";
                    Attachments[i].Table_Name = "Pm_Satisfaction";
                }
                params = {
                    "Attachments":Attachments,
                    "PmSatisfactionPmc": {
                        "Satisfaction_Id": satisId,
                        "Review_User": 0,
                        "Suggestion": suggestion,
                        "Handle_Time": closeTime+" 00:00:00"
                    },
                    "Satisfaction_Status": sst,
                    "approve_status": ast
                };
            }else{
                util.notification.simple("请上传图片附件!");
                mydApp.cancelPop1();
                util.submitCover(false);
                return false;
                params = {
                    "PmSatisfactionPmc": {
                        "Satisfaction_Id": satisId,
                        "Review_User": 0,
                        "Suggestion": suggestion,
                        "Handle_Time": closeTime+" 00:00:00"
                    },
                    "Satisfaction_Status": sst,
                    "approve_status": ast
                };
            }
            // console.info(JSON.stringify(params));
            this.closeForced(params);
        },
        closeSoft:function(){//闭环选择发短信给客户
            util.submitCover(true);
            var params;
            var satisId = util._param.satisId;
            var projectId = util._param.pjId;
            var suggestion = $(".note>textarea").val();
            if(suggestion==""||!suggestion){
                util.notification.simple("请说明关闭理由！");
                setTimeout(function(){
                    mydApp.cancelPop1();
                },1900);
                return false;
            }
            params = {
                "project_id":projectId,
                "satisfaction_Id":satisId,
                "suggestion":suggestion,
                "contact_person":this.rawData.Pm_Satisfaction.contact_person,
                "contact_tel":this.rawData.Pm_Satisfaction.contact_tel,
                "manager":this.rawData.Pm_Satisfaction.manager,
                "satisfaction_Status":5,
                "approve_status":0
            };
            console.info(JSON.stringify(params));
            this.sendMessage(params);
        },
        closesoftRepeat:function (){//闭环发短信给客户，客户没收到，重新发短信给客户
            util.submitCover(true);
            var params;
            var satisId = util._param.satisId;
            var projectId = util._param.pjId;
            var suggestion ;
            var len = this.rawData.Satisfaction_Pmc_List.length;
            for(var i=len-1;i>=0;i--){
                if(this.rawData.Satisfaction_Pmc_List[i].Role==1){
                    suggestion = this.rawData.Satisfaction_Pmc_List[i].Suggestion;
                    break;
                }
            }
            params = {
                "project_id":projectId,
                "satisfaction_Id":satisId,
                "suggestion":suggestion,
                "contact_person":this.rawData.Pm_Satisfaction.contact_person,
                "contact_tel":this.rawData.Pm_Satisfaction.contact_tel,
                "manager":this.rawData.Pm_Satisfaction.manager,
                "satisfaction_Status":5,
                "approve_status":0
            };
            // console.info(JSON.stringify(params));
            this.sendMessage(params);
        },
        changProLev:function(event){//改变ABC三个等级
            var value = $(event.currentTarget).attr("value");
            mydApp.level[mydApp.level[3].checked].Active = false;
            if(value=="a"){
                mydApp.level[0].Active = true;
                mydApp.level[3].checked = 0;
            }else if(value=="b"){
                mydApp.level[1].Active = true;
                mydApp.level[3].checked = 1;
            }else{
                mydApp.level[2].Active = true;
                mydApp.level[3].checked = 2;
            }
        },
        processData:function(){//整理数据

        },
        submitToPM:function(){//提交选择弹窗点击确认提交
            util.submitCover(true);
            var params;
            var satisId = util._param.satisId;
            var projectId = util._param.pjId;
            var suggestion = $(".note>textarea").val();
            var closeTime;
            closeTime = $(".closeTime1").val();
            var sst = this.rawData.Pm_Satisfaction.Satisfaction_Status,ast = this.rawData.Pm_Satisfaction.Approve_Status;
            if(sst == 2){
                if(ast == 1){
                    ast = 2;
                }else{
                    ast = 5;
                }
            }else{
                ast = 5;
            }
            var pm;
            var Attachments = this.ImgUrls;
            var aL = Attachments.length;
            if($(".approvalFlow")[0]){
                pm = {
                    "Satisfaction_Id": satisId,    
                    "Satisfaction_Code": 0,
                    "satisfaction_Status":sst,   
                    "approve_Status":ast,
                    "Project_Id": projectId,
                    "Affirm_Info": 0,
                    "Progress_Info": 0,
                    "Visitor": 0,
                    "Progress": 0,
                    "Suggestion": 0
                };
            }else{
                pm = {
                    "Satisfaction_Id": satisId,    
                    "Satisfaction_Code": 0,
                    "satisfaction_Status":sst,   
                    "approve_Status":ast,
                    "Project_Id": projectId,
                    "Affirm_Info": 0,
                    "Progress_Info": 0,
                    "Visitor": 0,
                    "Progress": 0,
                    "Suggestion": 0,
                    "Grade":this.level[3].checked+1
                };
            }
            if(aL>0){
                for(var i = 0;i<aL;i++){
                    Attachments[i].Bill_Id = satisId;
                    Attachments[i].Expand = "APP";
                    Attachments[i].Table_Name = "Pm_Satisfaction";
                }
                params = {
                    "Attachments":Attachments,
                    "Pm_Satisfaction": pm,
                    "Satisfaction_Pmc": {
                        "Satisfaction_Id": satisId,
                        "Review_User": 0,
                        "Suggestion": suggestion,
                        "Handle_Time": closeTime+" 00:00:00",
                    }
                };
            }else{
                params = {
                    "Pm_Satisfaction": pm,
                    "Satisfaction_Pmc": {
                        "Satisfaction_Id": satisId,
                        "Review_User": 0,
                        "Suggestion": suggestion,
                        "Handle_Time": closeTime+" 00:00:00",
                    }
                };
            }
            console.log(JSON.stringify(params));
            // alert(JSON.stringify(params));
            // return false;
            this.sendMention(params);
        },
        getData:function(){//进入页面请求信息主体信息
            var satisId = util._param.satisId;
            var projectId = util._param.pjId;
            var params = {
                "satisfaction_id":satisId,
                "project_id":projectId
            };
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetPmSatisfactionDetailed',{params:params}).then(function(response){
                if(response.data.status==0){
                    this.rawData = response.data.data;
                    var tempData1 = this.starData;
                    var evalue = this.rawData.Evaluate_List;
                    var len = evalue.length;
                    this.pico = 20/len;
                    this.starData = [];
                    var tempData = [];
                    for(var i = 0;i<len;i++){
                        tempData.push({"name":evalue[i].Type_Name,"score":evalue[i].Score,"id":i+1,"Type_Id":evalue[i].Satisfaction_Type});
                    }
                    this.starData = tempData;
                    /*for(var i=0;i<evalue.length;i++){
                        tempData1[i].score=evalue[i].Score;
                    }*/
                    // this.starData = tempData;
                    this.customSuggest = response.data.data.Pm_Satisfaction.Suggestion;
                    var sast = this.rawData.Pm_Satisfaction.Satisfaction_Status,apst = this.rawData.Pm_Satisfaction.Approve_Status;
                    if(sast==2){
                        if(apst==1){
                            this.button_status = 1;
                        }else if(apst==3){
                            this.button_status = 1;
                        }else if(apst==4){
                            this.button_status = 2;
                        }
                    }else if(sast==3){
                        if(apst==1){
                            this.button_status = 1;
                        }else if(apst==3){
                            this.button_status = 1;
                        }
                    }
                    // alert(this.button_status);
                    this.content = [{'name':response.data.data.Pm_Satisfaction.contact_person,'tel':response.data.data.Pm_Satisfaction.contact_tel}];
                    var L = this.rawData.Satisfaction_Pmc_List.length;   //将时间的格式处理下，截取一段时间
                    if(L!=0){
                        for(var j = 0;j<L;j++){
                            if(this.rawData.Satisfaction_Pmc_List[j].Handle_Time){
                                this.rawData.Satisfaction_Pmc_List[j].Handle_Time = this.rawData.Satisfaction_Pmc_List[j].Handle_Time.substring(0,10);
                            }
                        }
                    }
                    if(L>0){
                        for(var k = L-1;k>=0;k--){
                            if(this.rawData.Satisfaction_Pmc_List[k].Role == 1){
                                this.closeTime = this.rawData.Satisfaction_Pmc_List[k].Handle_Time;
                                break;
                            }
                        }
                    }
                }else{
                    util.notification.simple(response.data.msg);
                }
                initScroll(function(){});
                $(".loading").hide();
                util.submitCover(false);
            },function(response){
                $(".loading").hide();
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        getProjectMsg:function(projectId){
            var SafiId = util._param.satisId;
            var projectId = util._param.pjId;
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetProjectInfo',{params:{"project_id":projectId,"satisfaction_id":SafiId}}).then(function(response){
                if(response.data.status==0){
                    this.progress = response.data.data.progress;
                    this.getScoreType();
                }else{
                    util.notification.simple(response.data.msg);
                    $(".loading").hide();
                }
            },function(response){
                $(".loading").hide();
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        getScoreType:function(){//获取分数类型
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetParameters?progress='+this.progress).then(function(response){
                if(response.data.status==0){
                    this.starData = [];
                    var len = response.data.data.length;
                    // var len = 2;
                    this.pico = 20/len;
                    var tempData = [];
                    for(var i = 0;i<len;i++){
                        tempData.push({"name":response.data.data[i].Type_Name,"score":25,"id":response.data.data[i].Order_Id,"Type_Id":response.data.data[i].Type_Id});
                    }
                    this.starData = tempData;
                    this.getData();
                }else{
                    util.notification.simple(response.data.msg);
                    $(".loading").hide();
                }
            },function(response){
                $(".loading").hide();
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        sendMention:function(params){ /*http://172.16.55.29:55555/api/*/   //提交或者退回给项目经理接口
            this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/PostManagementReply',params).then(function(response){
                if(response.data.data){
                    util.notification.simple(response.data.msg);
                    setTimeout(function(){
                        if(util._param.status){
                            if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                                history.back();
                            }else{
                                window.location.reload();
                            }
                        }else{
                            history.back();
                        }
                    },1900);
                    $(".subtn").hide();
                    mydApp.cancelPop();
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        closeForced:function(params){ /*http://172.16.55.29:55555/api/*/   //不发短信闭环，强制闭环接口
            // console.log(JSON.stringify(params));
            this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/Post_PmcClose',params).then(function(response){
                if(response.data.data){
                    $(".subtn").hide();
                    $(".pop_window1").css({top:"100%"});
                    setTimeout(function(){
                        $(".bg").hide();
                        $(".pop_window1").hide();
                    },300);
                    util.notification.simple(response.data.msg);
                    setTimeout(function(){
                        if(util._param.status){
                            if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                                history.back();
                            }else{
                                window.location.reload();
                            }
                        }else{
                            history.back();
                        }
                    },1900);
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        sendMessage:function(params){//发短信给客户闭环的接口
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/RepeatSendMessage',{params:params}).then(function(response){
                if(response.data.data){
                    $(".subtn").hide();
                    util.notification.simple(response.data.msg);
                    setTimeout(function(){
                        mydApp.cancelPop1();
                        if(util._param.status){
                            if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                                history.back();
                            }else{
                                window.location.reload();
                            }
                        }else{
                            history.back();
                        }
                    },1900);
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        },
        closeAlready:function(){
            util.submitCover(1);
            /*var params = {
                "satisfaction_id":util._param.satisId
            };*/
            this.$http.post(util.baseUrl + 'PMSatisfactionsAPI/Post_PmcManualClose?satisfaction_id='+util._param.satisId).then(function(response){
                if(response.data.data){
                    util.notification.simple(response.data.msg);
                    setTimeout(function(){
                        if(util._param.status){
                            if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                                history.back();
                            }else{
                                window.location.reload();
                            }
                        }else{
                            history.back();
                        }
                    },1900);
                }else{
                    util.notification.simple("网络连接异常");
                }
                util.submitCover(false);
            },function(response){
                errorFun(response,util);
                util.submitCover(false);
            });
        }
    }
});

function getClientImgUrls(params){
    if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
        para=params;
    }else{
        para=JSON.parse(params);
    }
    
    if(para.Flag){
        var content=para.Content;
        var imgs=[],Imgs=[];
        for(var i=0;i < content.length;i++){
//          初步处理
            Imgs.push({"Doc_Name":content[i].Doc_Name,"Doc_Path":content[i].Doc_Path,"Doc_Size":content[i].Doc_Size});
//          二次处理
            var newimgsrc=content[i].Doc_Path.replace(/\\/g,"/");
            imgs.push({"Doc_Path":"http://222.92.194.195:9087/DownLoad/"+newimgsrc});
        }
        // alert(JSON.stringify(imgs));
        mydApp.ImgUrls=mydApp.ImgUrls.concat(Imgs);
        mydApp.Imgs=mydApp.Imgs.concat(imgs);
    }
}
