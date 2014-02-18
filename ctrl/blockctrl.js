function blockctrl($scope, $rootScope, $http, adminservice, mkPopup){
    var OBJ = "block";
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

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            var callback = adminservice.getSelCallback();
            if (callback !== undefined && callback !== null){
                callback(saved);
            }
        });

    });
}
