function todoctrl($scope, $http, adminservice, cartservice){
    loadToDos();
    function loadToDos(){
        var userID = cartservice.getAgentID();
        var f = {};
        f.ownerID = userID;
        f.dataobj = 'consumer';
//        var cv = {};
//        cv.oper = '<>';
//        cv.val = true;
//        f.complete = cv;
        f.order_by = {start:-1};
        adminservice.listObj('event', f, $http, function(data){
           $scope.events = data;
        });
    }

    $scope.launchEvent = function(e){
        e.complete = true;
        $scope.$emit("EV_LAUNCH_EVENT", e.data);
    }

    $scope.isDone = function(e){
        if (e.complete){
            return 'text-lt text-success';
        }
        else{
            return '';
        }
    }

    $scope.isDoneIcon = function(e){
        if (e.complete){
            return 'fa fa-check-square-o fa-fw text text-success';
        }
        else{
            return 'fa fa-square-o fa-fw text';
        }
    }

    $scope.done = function(e){
        e.complete = e.complete == true ? false : true;
        adminservice.saveObj(e, 'event', $http, function(saved){

        });
    }
}
