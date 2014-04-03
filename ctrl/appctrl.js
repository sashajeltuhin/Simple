function appctrl($scope, $http, adminservice){
    var OBJ = "apps";
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        if ($scope.obj.steps !== undefined){
            $scope.steps = $scope.obj.steps;
            delete $scope.obj.steps;
        }

        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
        });
    }

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname == 'tenant' && $scope.steps == undefined){
            mf = null;
        }
        return mf;
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            if ($scope.steps !== undefined){
                for(var s = 0; s < $scope.steps.length; s++){
                    var sObj = $scope.steps[s];
                    var newStep = {};
                    for(var k in sObj){
                        if (k !== '_id'){
                            newStep[k] = sObj[k];
                        }
                    }
                    newStep.app = $scope.obj.appID;
                    adminservice.saveObj(newStep, 'step', $http, function(fld){
                    });
                }
            }
            var callback = adminservice.getSelCallback();
            if (callback !== undefined && callback !== null){
                callback(saved);
            }

        });
    });
}
