function fieldctrl($scope, $http, adminservice){
    var OBJ = "fields";
    init();


    function init(){
        $scope.obj = adminservice.getSelObj();
        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
        });
    }

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname !== 'label' && metafld.fldname !== "fldtype" || metafld.fldname == "defval"){
            mf = null;
        }
        return mf;
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        var ny = $scope.obj._id == undefined;
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        $scope.obj.fldname = $scope.obj.label.replace(/ /g,"_").toLowerCase();
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
//            if (ny){
//                createFieldBlock(saved);
//            }
            var callback = adminservice.getSelCallback();
            if (callback !== undefined && callback !== null){
                callback(saved);
            }
        });

    });

    function createFieldBlock(saved){
        var block = {};
        block.tenant = saved.tenant;
        block.metaobj = saved.objname;
        block.name = saved.label;
        block.cat = "input";
        block.fldname = saved.fldname;
        var prefix = block.metaobj == 'consumer' ? 'c' : 'p';
        if (saved.fldopts !== undefined){
            var options = '<option value=""></option>';
            $.each(saved.fldopts, function(i, opt){
                options += '<option value="' + opt + '">' + opt + '</option>';
            });
            block.template = '<select ng-model="' + prefix + '.' + saved.fldname + '>' + options + '</select>';
        }else{
            var ft = saved.fldtype.replace(/\W/g, '');
            switch(ft){
                case 'text':
                    block.template = '<input type="text" ng-model="' + prefix + '.' + saved.fldname + '>';
                    break;
                case 'longtext':
                    block.template = '<textarea ng-model="' + prefix + '.' + saved.fldname + '></textarea>';
                    break;
                case 'bool':
                    block.template = '<input type="checkbox" ng-model="' + prefix + '.' + saved.fldname + '>';
                    break;
            }
        }
        adminservice.saveObj(block, 'block', $http, function(saved){

        });
    }


    $scope.newOpt = function(){
        if ($scope.obj.fldopts == undefined){
            $scope.obj.fldopts = [];
        }
        $scope.obj.fldopts.push("New Option");
    }

    $scope.removeOpt = function(o){
        var i = $scope.obj.fldopts.indexOf(o);
        $scope.obj.fldopts.splice(i, 1);
    }
}
