function dashctrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var OBJ = 'report';
    refresh();
    var map = {};
    $scope.srsort = {
        update: function(e, ui){
            $scope.$apply();
            console.log("sortable", ui);
            $.each($scope.sr, function(i, r){
                console.log("updating", r);
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
               loadreport(r.targetobj, r.f, function(data){
                   r.data = data;
               });
            });
        });

        adminservice.listObj(OBJ, {view: v, uitype:'multi'}, $http, function(mr){
            $scope.mr = mr;
            map['multi'] = mr;
        });

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
        report.f = {};
        report.view = adminservice.getCurrentView().name;
        report.targetobj = 'consumer';
        adminservice.loadMetaCustom(report.targetobj, $http, function(meta){
            var tenant = adminservice.getTenant().name;
            report.f.tenant = tenant;
            var filterdata = {};
            filterdata.f = report.f;
            filterdata.m = meta;
            adminservice.setFilterData(filterdata);
            report.uitype = uitype;
            report.order = map[uitype].length + 1;
            adminservice.setSelObj(report);
            var obj = {};
            obj.view = 'reportDetail.html';
            obj.title = "New report";
            $scope.$emit("EV_SWITCH_VIEW", obj);
        });
    }

    $scope.editReport = function(r){
        adminservice.setSelObj(r);
        adminservice.loadMetaCustom(r.targetobj, $http, function(meta){
            var filterdata = {};
            filterdata.f = r.f;
            filterdata.m = meta;
            adminservice.setFilterData(filterdata);
            var obj = {};
            obj.view = 'reportDetail.html';
            obj.title = "Edit report " + r.title;
            $scope.$emit("EV_SWITCH_VIEW", obj);
        });
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
