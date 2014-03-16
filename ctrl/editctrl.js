function editctrl($scope, $http, $parse, adminservice){
    var OBJ = adminservice.getSelected();
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();

        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
        });
    }



    function prepareField(metafld){
        var mf = metafld;

        return mf;
    }

    $scope.onfldChange = function(fd){

    }

    function refreshFilter(objname){
        adminservice.loadMetaCustom(objname, $http, function(meta){
            if ($scope.obj.filter.tenant == undefined){
                var tenant = adminservice.getTenant().name;
                $scope.obj.filter.tenant = tenant;
            }

            $scope.$broadcast("EV_FILTER_REBUILD", meta, $scope.obj.filter, 'Filter');
        });
    }

    $scope.$on('EV_FILTER_CHANGED', function(event, obj){
        $scope.obj.filter = obj;
    });

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);

        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            //$scope.onDash();
            var fn = $scope[adminservice.getCurrentView().controller];
            fn();
//
        });

    });
}
