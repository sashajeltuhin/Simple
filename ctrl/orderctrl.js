function orderctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.app = cartservice.getAppObj();
    $scope.c = cartservice.getCustomer();


    $scope.templateUrl = cartservice.getTemplateURL();

    $scope.confirmCustomer = function(){
        var token = $scope.c.fname == undefined || $scope.c.fname.length == 0 ? 'customer' : $scope.c.fname;
        var msg = 'Dear ' + token + ', your order has been verified by an independent 3rd party';
        cartservice.confirmCustomer($scope.c, msg, 'FUSE Merchandising', $http, function(err, msg){
           if (err !== null){
               $scope.problem = err;
           }
            else{
               $scope.ok = msg;
           }

        });
    }


}
