function exportctrl($scope, $rootScope, $http, $location, adminservice, mkPopup){
    $scope.topUrl = topUrl;
    $scope.fileName = "";
    var selected = adminservice.getSelected();
    loadFields();

    function loadFields(){
        adminservice.loadMeta(selected, $http, function(m){
            $scope.fieldMap = m;
            $scope.obj = adminservice.buildobj(m);
        });
    }

    $scope.defineDefs = function(){

        adminservice.createObj('Assign default values', $scope.obj, selected, mkPopup, $scope, $http, function(){

        });
    }

    $scope.excludeColumn = function(c){
        var ind = $scope.colMap.indexOf(c);
        $scope.colMap.splice(ind, 1);
    }

    $scope.onImportUploaded = function(event){
        $scope.fileName = event.name;
        adminservice.getColumnMap($scope.fileName, selected, $http, function(map){
        $scope.colMap = map;
        });
    }

    $scope.importData = function(){
        var importObj = {};
        importObj.map = [];
        $.each($scope.colMap, function(i, c){
            var fld = $scope.fieldMap[i];
            cm = {};
            cm.field = fld.fldname;
            cm.col = c;

            importObj.map.push(cm);
        });
        if ($scope.obj !== undefined){
            importObj.defs = {};
            for(var key in $scope.obj){
                importObj.defs[key] = $scope.obj[key];
            }

        }
        adminservice.import($scope.fileName, importObj,  selected, $http, function(recs){
            mkPopup(
                {
                    template: '<div>' + recs + ' records imported</div>',
                    title: 'Confirmation',
                    scope: $scope,
                    backdrop: false,
                    success: {label: 'Got it'}
                });
        });
    }
}