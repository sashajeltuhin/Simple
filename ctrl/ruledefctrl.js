function ruledefctrl($scope, $rootScope, $http, adminservice, mkPopup){
    var SEG = "segment";
    var fieldMeta = [];
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        adminservice.loadMeta($scope.obj.obj, $http, function(meta){
            fieldMeta = meta;
            adminservice.loadMeta(SEG, $http, function(m){
                $scope.fieldList = adminservice.bindObj(m, $scope.obj, prepareField);
            });
        });
    }

    function prepareField(metafld){
        var mf = metafld;

        if (metafld.fldname == "field"){
            mf.opts = fieldMeta;
        }
        else if (metafld.fldname == 'app' || metafld.fldname == "obj" || metafld.fldname == "order"){
            mf = null;
        }

        return mf;
    }

    $scope.onfldChange = function(fd){
        console.log("field changed", fd);
        if (fd.fldname == 'field'){
            var selectedFld = adminservice.getFM($scope.obj.obj, fd.fldvalue);
            console.log("selected field", selectedFld);
            $scope.obj.fldtype = selectedFld.fldtype;
        }
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        var callback = adminservice.getSelCallback();
        if (callback !== undefined && callback !== null){
            callback($scope.obj);
        }
    });
}
