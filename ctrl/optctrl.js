function optctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.cp = cartservice.getProdsInCart();
    $scope.c = cartservice.getCustomer();
    $scope.templateUrl = cartservice.getTemplateURL();
    $scope.carttotal = cartservice.cartTotal();

    $scope.endCust = function(){
        onStep();
        cartservice.updateCustomer(function(){
            $scope.step = cartservice.nextStep($scope.step.name);
            $scope.changeView($scope.step.name);
            onStep($scope.step.name);
        });

    }

}

