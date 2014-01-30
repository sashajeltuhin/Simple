function userctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.selUser = adminservice.getSelUser();
    var date = new Date($scope.selUser.startDate);
    $scope.since = date.getMonth() + ' ' + date.getFullYear();


}