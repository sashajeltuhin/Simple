function todoctrl($scope, $http, adminservice, cartservice){
    loadToDos();
    function loadToDos(){
        var userID = cartservice.getAgentID();
        var f = {};
        f.ownerID = userID;
        f.dataobj = 'consumer';
        var cv = {};
        cv.oper = '<>';
        cv.val = true;
        f.complete = cv;
        cv.order_by = {start:-1};
        adminservice.listObj('event', f, $http, function(data){
           $scope.events = data;
        });
    }

    $scope.launchEvent = function(e){
        e.complete = true;
        $scope.$emit("EV_LAUNCH_EVENT", e.data);
    }

}
