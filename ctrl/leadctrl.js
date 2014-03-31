function leadctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.obj = {};
    $scope.selTenant = adminservice.getTenant();
    $scope.obj.type = 'lead';
    $scope.obj.tenant = $scope.selTenant.name;
    $scope.leadevent = {};

    init();

    function init(){
        adminservice.listObj('user', {tid: $scope.selTenant._id}, $http, function(data){
           $scope.admins = data;
        });
    }


    $scope.createLead = function(){

        adminservice.saveObj($scope.obj, 'consumer', $http, function(saved){
            if ($scope.leadevent.start !== undefined &&  $scope.leadevent.ownerID !== undefined){
                $scope.leadevent.type = 'user';
                $scope.leadevent.dataobj = 'consumer';
                $scope.leadevent.data = [saved];
                adminservice.objToString(saved, $scope.leadevent.dataobj, $http, function(desc){
                    $scope.leadevent.objdesc = desc;
                    adminservice.saveObj($scope.leadevent, 'event', $http, function(){

                    });
                });
            }

        });
    }
}
