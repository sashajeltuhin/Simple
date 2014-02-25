function messagectrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    $scope.rootUrl = topUrl;
    var tenObj = adminservice.getTenant();
    $scope.newtotal = 0;

    setInterval(function loadNewNotes(){
        $scope.me = adminservice.getAdminSession();
        var filter = {};
        filter.status = 'new';
        filter.toID = $scope.me.uid;
        adminservice.listObj('note', filter, $http, function(d){
            $scope.newtotal = d.length;
            $scope.newnotes = d;
        });
    }, 10000);





    $scope.openNote = function(n){
        adminservice.setSelObj(n);
        var obj = {};
        obj.view = 'notedetail.html';
        obj.title = "Message";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }


}

