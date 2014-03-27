function leadctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.obj = {};
    $scope.selTenant = adminservice.getTenant();
    $scope.obj.type = 'lead';
    $scope.obj.tenant = $scope.selTenant.name;


    $scope.createLead = function(){

        adminservice.saveObj($scope.obj, 'consumer', $http, function(){

        });
    }
}
