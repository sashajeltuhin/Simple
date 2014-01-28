function dashctrl($scope, $http, adminservice){
    var tenObj = adminservice.getTenant();
    loadreport('consumer', {tenant:tenObj.name});

    $scope.$on("EV_TENANT_PICKED", function(event, t){
        loadreport("consumer", {tenant:t.name});
    });

    function loadreport(obj, filter){
        adminservice.total(obj, filter, $http, function(d){
            $scope.total = d.data;
        });
    }
}
