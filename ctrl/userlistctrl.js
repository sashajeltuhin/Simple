function userlistctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    var tenantID = adminservice.getTenant()._id;
    loadUsers();
    function loadUsers(){
        adminservice.listObj('user', {tid: tenantID},  $http, function(data){
            $scope.userList = data;
            $.each($scope.userList, function(i, u){
                var date = new Date(u.startDate);
                u.sinceFormatted = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
            })
        });
    }

    $scope.openDetail = function(u){
        adminservice.setSelUser(u);
        var obj = {};
        obj.view = 'adminprofile.html';
        obj.title = "User Management";
        obj.toolbar = 'secTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.openNew = function(){
        adminservice.setSelUser({});
        var obj = {};
        obj.view = 'createUser.html';
        obj.title = "User Management";
        obj.toolbar = 'secTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

}