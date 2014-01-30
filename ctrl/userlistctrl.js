function userlistctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    loadUsers();
    function loadUsers(){
        adminservice.listObj('user', {},  $http, function(data){
            $scope.userList = data;
        });
    }

    $scope.openDetail = function(u){
        adminservice.setSelUser(u);
        $scope.$emit("EV_SWITCH_VIEW", 'adminprofile.html');
    }

}