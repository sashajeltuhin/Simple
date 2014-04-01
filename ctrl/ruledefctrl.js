function ruledefctrl($scope, $rootScope, $http, adminservice, mkPopup){
    var SEG = "segment";
    var fieldMeta = [];
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        adminservice.loadMeta($scope.obj.obj, $http, function(meta){
            fieldMeta = meta;
            var numchildren = 0;
            var subs = [];
            for(var x = 0; x < meta.length; x++){
                var fld = meta[x];
                if (fld.fldtype == 'object'){
                    numchildren++;
                }
            }
            var processed = 0;
            for(var i = 0; i < meta.length; i++){
                var fld = meta[i];
                if (fld.fldtype == 'object'){

                    adminservice.loadMeta(fld.optobj, $http, function(submeta){
                        for(var s = 0; s < submeta.length; s++){
                            var subfld = adminservice.cloneObj(submeta[s]);
                            subfld.fldname = fld.fldname + '.' + subfld.fldname;
                            subfld.label = fld.label + ' ' + subfld.label;
                            subs.push(subfld);
                        }
                        processed++;
                        if (processed == numchildren){
                            fieldMeta = fieldMeta.concat(subs);
                            adminservice.loadMeta(SEG, $http, function(m){
                                $scope.fieldList = adminservice.bindObj(m, $scope.obj, prepareField);
                            });
                        }
                    });
                }
            }
            if (numchildren == 0){
                adminservice.loadMeta(SEG, $http, function(m){
                    $scope.fieldList = adminservice.bindObj(m, $scope.obj, prepareField);
                });
            }
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
        var selectedFld = adminservice.getFM($scope.obj.obj, fd.fldvalue);
        console.log("selected field", selectedFld);
        $scope.obj.fldtype = selectedFld.fldtype;
        //rebuild value template to drop-down depending on the selected field metadata
        if (fd.fldname == 'field'){
            for(var i = 0; i < $scope.fieldList.lentgh; i++){
                if ($scope.fieldList[i].fldname == 'val'){
                    adminservice.buildField($scope.fieldList[i], selectedFld, $scope.obj);
                    break;
                }
            }
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
