function userlistctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    var tenantID = adminservice.getTenant()._id;
    loadUsers();
    function loadUsers(){
        adminservice.listObj('user', {tid: tenantID},  $http, function(data){
            $scope.userList = data;
        });
    }

    $scope.openDetail = function(u){
        adminservice.setSelUser(u);
        var obj = {};
        obj.view = 'adminprofile.html';
        obj.title = "User Management";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.openNewUser = function(){
        adminservice.setSelUser({});
        var obj = {};
        obj.view = 'createUser.html';
        obj.title = "User Management";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

}