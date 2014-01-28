function userctrl($scope, $http, adminservice){
    loadUser();
     function loadUser(){
        var s = adminservice.getAdminSession();
        var f = {};
        f._id = s.uid;
        adminservice.listObj('user',f,  $http, function(data){
            $scope.adminUser = data[0];
        });
    }

}