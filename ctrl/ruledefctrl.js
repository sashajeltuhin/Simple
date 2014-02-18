function ruledefctrl($scope, $rootScope, $http, adminservice, mkPopup){
    var SEG = "segment";
    var prodMeta = [];
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        adminservice.listObj("fields", {objname:"product", order_by:{"title":1}}, $http, function(meta){
            prodMeta = meta;
            adminservice.loadMeta(SEG, $http, function(meta){
                //$scope.propsEl = adminservice.buildForm(meta, updateProdFieldList, $scope.obj);
                $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
            });
        });
    }

    function prepareField(metafld){
        var mf = metafld;

        if ($scope.obj.obj == "product" && metafld.fldname == "field"){
            mf.opts = prodMeta;
        }
        else if (metafld.fldname == 'app' || metafld.fldname == "obj" || metafld.fldname == "order"){
            mf = null;
        }

        return mf;
    }

    function updateProdFieldList(metafld, exp){

        if (exp.obj == "product" && metafld.fldname == "field"){
            return prodMeta;
        }
        return null;
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        var callback = adminservice.getSelCallback();
        if (callback !== undefined && callback !== null){
            callback($scope.obj);
        }
    });
}
