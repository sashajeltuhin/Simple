function dashctrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var OBJ = 'report';
    refresh();
    var map = {};
    $scope.srsort = {
        update: function(e, ui){
            $.each($scope.sr, function(i, r){
                r.order = i+1;
                adminservice.saveObj(r, OBJ, $http, function(){

                });
            });
        }
    };

    $scope.$on("EV_TENANT_PICKED", function(event, t){
        refresh();
    });

    function refresh(){
        var v = adminservice.getCurrentView().name;
        var t = adminservice.getTenant().name;
        adminservice.listObj(OBJ, {view: v, uitype:'single', allowedTenant:[t]}, $http, function(sr){
            $scope.sr = sr;
            map['single'] = sr;
            $.each($scope.sr, function(i, r){
                r.template = serverUrl + 'singlepointreport.html';
               loadreport(r.targetobj, r.filter, function(data){
                   r.data = data;
               });
            });
        });

        adminservice.listObj(OBJ, {view: v, uitype:'multi'}, $http, function(mr){
            $scope.mr = mr;
            map['multi'] = mr;
        });

//        var tenObj = adminservice.getTenant();
//        $scope.providers = tenObj.providers == undefined? 0 : tenObj.providers.length;
//
//        loadreport('consumer', {tenant:tenObj.name}, function(data){
//            $scope.total = data;
//        });
//        loadreport('consumer', {tenant:tenObj.name, type:'client'}, function(data){
//            $scope.orders = data;
//        });
//        loadreport('user', {tenant:tenObj.name}, function(data){
//            $scope.admins = data;
//        });
    }

    function loadreport(obj, filter, callback){
        adminservice.total(obj, filter, $http, function(d){
            if (callback !== undefined){
                callback(d.data);
            }
        });
    }
    $scope.createSingle = function(){
        createReport('single');
    }

    $scope.createMulti = function(){
        createReport('multi');
    }

    function createReport (uitype){
        var report = {};
        report.view = adminservice.getCurrentView().name;
        report.targetobj = 'consumer';
        report.uitype = uitype;
        report.order = map[uitype].length + 1;
        adminservice.setSelObj(report);
        var obj = {};
        obj.view = 'reportDetail.html';
        obj.title = "New report";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.editReport = function(r){
        adminservice.setSelObj(r);
        var obj = {};
        obj.view = 'reportDetail.html';
        obj.title = "Edit report " + r.title;
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.deleteReport = function(r){
        adminservice.deleteObj(r, OBJ, $http, function(){
            var list = map[r.uitype];

            for(var i = list.length - 1; i >= 0; i--){
                if (list[i]._id == r._id){
                    list.splice(i, 1);
                }
            }
        });
    }
}
