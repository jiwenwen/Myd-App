var mydApp = new Vue({
    el: "#mydApp",
    data: {
        starData:[
            {"name":"质量管控","score":25,"id":1},
            {"name":"进度把控","score":25,"id":2},
            {"name":"安全文明","score":25,"id":3},
            {"name":"服务配合","score":25,"id":4}
        ],
        state:'',
        message:'不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意不满意'
    },
    computed: {
        total: function(){
            var totalStar = 0;
            for(var i = 0; i < this.starData.length; i ++){
                totalStar += this.starData[i].score;
            }
            return totalStar + "%";
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
			/*判断设备*/
			var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
			if(isiOS){
				$("html").css("padding-top","20px");
				$("html").css("box-sizing","border-box");
			}
        },
        goBack:function(){
            history.back();
        },
        submitAc:function(){
            $(".bg").show(10,function(){
                $(".pop_window").css({top:"33%"});
            });

        },
        cancelPop:function(){
            $(".pop_window").css({top:"100%"});
            setTimeout(function(){
                $(".bg").hide();
            },300);
        },
        goBack:function(){
            history.back();
        }
    }
})
