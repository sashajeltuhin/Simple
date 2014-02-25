function inboxctrl($scope, $http, adminservice){
    var NOTE = 'note';
    var serverUrl = topUrl + adminURL + '/templ/';
    $scope.rootUrl = topUrl;
    var tenObj = adminservice.getTenant();
    $scope.me = adminservice.getAdminSession();
    $scope.selnote = adminservice.getSelObj();
    if ($scope.selnote.senderID == undefined){
        adminservice.listObj(NOTE, {status:"read"}, $http, function(rn){
           $scope.readNotes = rn;
            $.each($scope.readNotes, function(i, note){
               note.shortened = note.subject.substring(0, 20) + '...';
            });
        });

        adminservice.listObj(NOTE, {status:"new"}, $http, function(nn){
            $scope.newNotes = nn;
            $.each($scope.newNotes, function(i, note){
                note.shortened = note.subject.substring(0, 20) + '...';
            });
        });
    }
    else if ($scope.selnote.toID !== undefined){
        if ($scope.selnote.status !== "read"){
            $scope.selnote.status = "read";
            $scope.selnote.openTime = new Date();
            adminservice.saveObj($scope.selnote, NOTE, $http,function(read){
                $scope.selnote = read;
            });
        }
    }

    $scope.newNote = function(){
        var newNote = freshNote();
        adminservice.setSelObj(newNote);
        var obj = {};
        obj.view = 'compose.html';
        obj.title = "New Message";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.openNote = function(n){
        adminservice.setSelObj(n);
        var obj = {};
        obj.view = 'notedetail.html';
        obj.title = "Message";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function freshNote(){
        var note = {};
        note.senderID = $scope.me.uid;
        note.senderName = $scope.me.fname + ' ' + $scope.me.lname;
        note.senderAvatar = $scope.me.imageUrl;
        note.status = "new";
        return note;
    }

    $scope.sendNote = function(){
        $scope.selnote.createdTime = new Date();
        adminservice.saveObj($scope.selnote, NOTE, $http,function(sent){
            adminservice.setSelObj({});
            $scope.openInbox();
        });
    }

    $scope.backToInbox = function(){
        adminservice.setSelObj({});
        $scope.openInbox();
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
        $scope.selnote.toID = selected;
        adminservice.listObj('user', {_id:selected}, $http, function(data){
            var u = data[0];
            $scope.selnote.toName = u.fname + ' ' + u.lname;
            $scope.selnote.toAvatar = u.imageUrl;
        });
    }
}

