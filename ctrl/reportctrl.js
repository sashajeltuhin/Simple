function reportctrl($scope, $http, $parse, adminservice){
    var OBJ = "report";
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        if ($scope.obj.filter == undefined){
            $scope.obj.filter = {};
        }
        //initSec();
        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.reportMeta = meta;
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
            refreshFilter($scope.obj.targetobj);
        });
    }

    $scope.openFilter = function(){
        refreshFilter($scope.obj.targetobj);
    }

    function initSec(){
        if ($scope.secFilter == undefined){
            $scope.secFilter = {};
        }
        var tenant = adminservice.getTenant().name;
        if ($scope.secFilter.allowedTenant == undefined){
            $scope.secFilter.allowedTenant = {};
            $scope.secFilter.allowedTenant[tenant] = true;
        }
        $scope.$broadcast("EV_FILTER_REBUILD", $scope.reportMeta, $scope.secFilter, 'Security');
    }

    $scope.openSec = function(){
        initSec();
    }

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname == 'filter' || metafld.fldname == 'created' || metafld.fldname == 'createdBy'
            || metafld.fldname == 'view' || metafld.fldname == 'uitype' || metafld.fldname == 'allowedTenant'){
            mf = null;
        }
        return mf;
    }

    $scope.onfldChange = function(fd){
        if (fd.fldname == 'targetobj'){
            //reload filter
            $scope.obj.targetobj = fd.fldvalue;
            refreshFilter(fd.fldvalue);
        }
    }

    function refreshFilter(objname){
        adminservice.loadMeta(objname, $http, function(meta){
            if ($scope.obj.filter.tenant == undefined){
                var tenant = adminservice.getTenant().name;
                $scope.obj.filter.tenant = tenant;
            }
            $scope.$broadcast("EV_FILTER_REBUILD", meta, $scope.obj.filter, 'Filter');
        });
    }

    $scope.$on('EV_FILTER_APPLY', function(event, obj){
        $scope.obj.filter = obj;
    });

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        $scope.obj.created = new Date();
        $scope.obj.createdBy = adminservice.getAdminSession().uid;
        $scope.obj.filter = adminservice.cleanFilter($scope.obj.filter);
        $scope.secFilter = adminservice.cleanFilter($scope.secFilter);
        if ($scope.secFilter.allowedTenant !== undefined){
            $scope.obj.allowedTenant = $scope.secFilter.allowedTenant;
        }
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            //$scope.onDash();
            var fn = $scope[adminservice.getCurrentView().controller];
            fn();
//            var callback = adminservice.getSelCallback();
//            if (callback !== undefined && callback !== null){
//                callback(saved);
//            }
//            var fn= adminservice.getCurrentView().controller;
//            var fnc = $parse(fn);
//            $scope.$apply(function() {
//                fnc($scope, {});
//            });
        });

    });
}
