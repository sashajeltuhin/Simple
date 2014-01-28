function messagectrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    $scope.rootUrl = topUrl;
    var tenObj = adminservice.getTenant();
    $scope.newtotal = 0;
    loadNotes();

    function loadNotes(){
        $scope.me = adminservice.getAdminSession();
        var filter = {};
        filter.status = 'new';
        filter.toID = $scope.me.uid;
        adminservice.listObj('note', filter, $http, function(d){
            $scope.newtotal = d.length;
            $scope.newnotes = d;
        });
    }

    $scope.newNote = function(){
        $scope.selnote = {};
        $scope.$emit("EV_SWITCH_VIEW", 'compose.html');
    }

    $scope.openNote = function(n){
        $scope.selnote = n;
        $scope.$emit("EV_SWITCH_VIEW", 'notedetail.html');
    }

    $scope.sendNote = function(){
        $scope.selnote.createdTime = new Date();
        $scope.selnote.senderID = $scope.me.uid;
        $scope.selnote.senderName = $scope.me.fname + ' ' + $scope.me.lname;
        $scope.selnote.senderAvatar = $scope.me.imageUrl;
    }

    $scope.listUsers = function(q){
        var f = {};
        f.lname = q.term + '*';
        adminservice.listObj('user', f, $http, function(data){
            var d = {};
            d.results = [];
            $.each(data, function(i, item){
                d.results.push({id: item._id, text: item.fname + ' ' + item.lname})
            });
            q.callback(d);
        });
    }

    $scope.selectSender = function(selected){
        $scope.selnote.toID = selected._id;
        $scope.selnote.toName = selected.fname + ' ' + selected.lname;
        $scope.selnote.toAvatar = selected.imageUrl;
    }
}

