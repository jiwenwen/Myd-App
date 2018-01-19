var mydApp = new Vue({
    el: "#mydApp",
    data: {
        'rawData':[]
    },
    created: function () {

    },
    mounted: function () {
        this.init();
    },
    watch: {},
    methods: {
        init: function () {
            var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            /*if(isiOS){
                $("html").css("padding-top","20px");
                $("html").css("box-sizing","border-box");
            }*/
            this.getProjectName();
        },
        getProjectName:function (){
            util.submitCover(1);
            var startTime = localStorage.getItem("startTime");
            var endTime = localStorage.getItem("endTime");
            var params = {
                "searchEntity.startTime":startTime,
                "searchEntity.endTime":endTime,
                "searchEntity.companyId":util._param.companyId,
                "searchEntity.satisfied_Type":util._param.satisfied_Type,
                "searchEntity.project_Type":util._param.project_Type
            };
            this.$http.get(util.baseUrl + 'PMSatisfactionsAPI/GetProjectReport',{params:params}).then(function (response){
                if(response.data.data){
                    this.rawData = response.data.data;
                }
                util.submitCover();
            },function (response){
                errorFun(response,util);
                util.submitCover();
            });
        }
    }
});