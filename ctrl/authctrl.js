function authctrl($scope, $http, adminservice){
    $scope.oper = {};

    $scope.login = function(){
        adminservice.signIn($scope.oper.uname, $scope.oper.upass, $http, function(err, data){
            if (err !== null){
                $scope.errmsg = err;
            }
            else if (data !== null){
               $scope.$emit("EV_SIGNED_IN", data);
            }
        });

    }
}