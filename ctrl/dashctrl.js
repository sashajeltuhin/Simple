function dashctrl($scope, $http, adminservice){

    refresh();

    $scope.$on("EV_TENANT_PICKED", function(event, t){
        refresh();
    });

    function refresh(){
        var tenObj = adminservice.getTenant();
        $scope.providers = tenObj.providers == undefined? 0 : tenObj.providers.length;

        loadreport('consumer', {tenant:tenObj.name}, function(data){
            $scope.total = data;
        });
        loadreport('consumer', {tenant:tenObj.name, type:'client'}, function(data){
            $scope.orders = data;
        });
        loadreport('user', {tenant:tenObj.name}, function(data){
            $scope.admins = data;
        });
    }

    function loadreport(obj, filter, callback){
        adminservice.total(obj, filter, $http, function(d){
            if (callback !== undefined){
                callback(d.data);
            }
        });
    }
}
