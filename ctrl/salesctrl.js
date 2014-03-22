function salesctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.app = cartservice.getAppObj();
    $scope.c = cartservice.getCustomer();

    $scope.templateUrl = cartservice.getTemplateURL();


}
