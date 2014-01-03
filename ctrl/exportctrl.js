function exportctrl($scope, $rootScope, $http, $location, adminservice){
    $scope.topUrl = topUrl;
    $scope.fileName = "";
    var selected = adminservice.getSelected();
    loadFields();

    function loadFields(){
        adminservice.loadMeta(selected, $http, function(m){
            $scope.fieldMap = m;
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
        var map = [];
        $.each($scope.colMap, function(i, c){
            cm = {};
            cm.field = fldname;
            cm.col = c;
            map.push(cm);
        })
        adminservice.import(event.name, map,  selected, $http, function(recs){
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