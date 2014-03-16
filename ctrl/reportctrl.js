function reportctrl($scope, $http, $parse, adminservice){
    var OBJ = "report";
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        if ($scope.obj.f == undefined){
            $scope.obj.f = {};
        }
        initSec();
        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.reportMeta = meta;
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
            //refreshFilter($scope.obj.targetobj, true);
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
        //$scope.$broadcast("EV_FILTER_REBUILD", $scope.reportMeta, $scope.secFilter, 'Security');
    }

    $scope.openSec = function(){
        initSec();
    }

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname == 'f' || metafld.fldname == 'created' || metafld.fldname == 'createdBy'
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
        adminservice.loadMetaCustom(objname, $http, function(meta){
            if ($scope.obj.f.tenant == undefined){
                var tenant = adminservice.getTenant().name;
                $scope.obj.f.tenant = tenant;
            }

            $scope.$broadcast("EV_FILTER_REBUILD", meta, $scope.obj.f, 'Filter');
        });
    }

    $scope.$on('EV_FILTER_CHANGED', function(event, obj){
        $scope.obj.f = obj;
    });

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        $scope.obj.created = new Date();
        $scope.obj.createdBy = adminservice.getAdminSession().uid;
        $scope.obj.f = adminservice.cleanFilter($scope.obj.f);
        $scope.secFilter = adminservice.cleanFilter($scope.secFilter);
        if ($scope.secFilter.allowedTenant !== undefined){
            $scope.obj.allowedTenant = $scope.secFilter.allowedTenant;
        }
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            //$scope.onDash();
            var fn = $scope[adminservice.getCurrentView().controller];
            fn();

        });

    });
}
