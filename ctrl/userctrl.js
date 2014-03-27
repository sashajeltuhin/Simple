function userctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.selUser = adminservice.getSelUser();
    $scope.selTenant = adminservice.getTenant();
    if ($scope.selUser._id !== undefined){
        var date = new Date($scope.selUser.startDate);
        $scope.since = date.getMonth() + ' ' + date.getFullYear();
        initEvents();
        loadreport('session', {uid: $scope.selUser._id}, function(data){
            $scope.logins = data;
        });

        if ($scope.selUser.tenants == undefined){
            $scope.selUser.tenants = [];
            adminservice.listObj('tenant', {name: $scope.selUser.tenant}, $http, function(data){
               $scope.selUser.tenants.push(data[0]._id);
               loadTens();
            });
        }
        else{
            loadTens();
        }
    }
    else{
        if ($scope.selUser.imageUrl == undefined){
            $scope.selUser.imageUrl  = $scope.selTenant.userImageUrl;
        }
    }

    function initEvents(){
        $scope.mytodos = [];
        var f = {type:'user', ownerID: $scope.selUser._id};
        adminservice.listObj('event', f, $http, function(data){
            $scope.todos = data;
            $.each($scope.todos, function(i, v){
                var date = new Date(v.start);
                var  month = date.getMonth()+1, year = date.getFullYear(), day = date.getDate();
                v.time = date.toTimeString().replace(/.*(\d{2}:\d{2}).*/, "$1");
                $scope.mytodos.push([day + "/" + month + '/' + year, v.title, '#', '#fb6b5b', v.objdesc]);
                console.log('today events', $scope.mytodos);
            })
        });
    }


    $scope.onProfileImage = function(event){
        var url = event.url.replace(topUrl,"");
        $scope.selUser.imageUrl = url;
        saveUser();
    }

    $scope.loadTenants = function(){
        loadTens();
    }

    function loadTens(){
        $scope.availableSection = 'Tenants';

        adminservice.listObj('tenant', {_id: $scope.selUser.tenants}, $http, function(data){
            $scope.mytenants = data;

        });

        var fv = {};
        fv.oper = '<>';
        fv.val = $scope.selUser.tenants;
        $scope.existingList = [];
        adminservice.listObj('tenant', {_id: fv}, $http, function(data){
            $.each(data, function(i, t){
                var item = {};
                item._id = t._id;
                item.name = t.name;
                item.imageUrl = t.logo;
                $scope.existingList.push(item);
            });

        });
    }

    $scope.onAddTenant = function(list){
        console.log("updated list", list);
        var c = 0;
        $.each(list, function(i, item){
            if (item['$scope'].i !== undefined){
                $scope.selUser.tenants.push(item['$scope'].i._id);
                c++;
            }
        });
        if (c > 0){
            saveUser(function(){
                loadTens();
            });
        }
    }

    $scope.removeTenant = function(t){
        var ind = $scope.selUser.tenants.indexOf(t._id);
        $scope.selUser.tenants.splice(ind, 1);
        saveUser(function(){
            loadTens();
        });
    }

    $scope.saveObj = function(){
        saveUser();
    }

    function saveUser(callback){
        adminservice.saveObj($scope.selUser, 'user', $http, function(d){
            $scope.selUser = d;
            if (callback !== undefined){
                callback();
            }
        });
    }

    $scope.openNew = function(){
        adminservice.setSelUser({});
        var obj = {};
        obj.view = 'createUser.html';
        obj.title = "User Management";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.createUser = function(){

        $scope.selUser.tenant = $scope.selTenant.name;
        $scope.selUser.tid = $scope.selTenant._id;
        $scope.selUser.tenants = [];
        $scope.selUser.tenants.push($scope.selUser.tid);
        $scope.selUser.startDate = new Date();

        saveUser(function(){
            adminservice.setSelUser($scope.selUser);
            var obj = {};
            obj.view = 'adminprofile.html';
            obj.title = "User Management";
            obj.toolbar = 'secTools.html';
            $scope.$emit("EV_SWITCH_VIEW", obj);
        });
    }

    function loadreport(obj, filter, callback){
        adminservice.total(obj, filter, $http, function(d){
            if (callback !== undefined){
                callback(d.data);
            }
        });
    }

    function getDummyProv(){
        var dummy = {};
        dummy._id = 0;
        dummy.label = 'Drag from the list on the right';
        return dummy;
    }
    $scope.loadActions = function(){
        loadActions();
    }

    function loadActions(){
        $scope.existingActions = [];
        if ($scope.selUser.actions== undefined){
            $scope.selUser.actions = [];
            $scope.myactions = [];
            $scope.myactions.push(getDummyProv());
        }
        else{
            var filter = {};
            var flds = {};
            flds.oper = 'in';
            flds.val = $scope.selUser.actions;
            filter._id = flds;

            adminservice.listObj('action', filter, $http, function(data){
                $scope.myactions = data;
                if ($scope.myactions.length == 0){
                    $scope.myactions.push(getDummyProv());
                }
            });
        }
        var f = {};
        f.tid = $scope.selTenant._id;
        if ($scope.selUser.actions.length > 0){
            var fv = {};
            fv.oper = '<>';
            fv.val = $scope.selUser.actions;
            f._id = fv;
        }
        console.log('loading available actions with filter', f);
        adminservice.listObj('action', f, $http, function(data){
            $.each(data, function(i, t){
                var item = {};
                item._id = t._id;
                item.name = t.name;
                item.desc = t.label;
                $scope.existingActions.push(item);
            });
        }, f);
    }

    $scope.onAddAction = function(list){
        for(var i = 0; i < list.length; i++){
            var item = list[i];
            if (item['$scope'].a !== undefined && item['$scope'].a._id !== 0){
                var fid = item['$scope'].a._id;
                if (fid !== undefined && $scope.selUser.actions.indexOf(fid) < 0){
                    $scope.selUser.actions.push(fid);

                }
            }
        }
        saveUser(function(){
            loadActions();
        });
    }

    $scope.removeAction = function(f){
        var ind = $scope.selUser.actions.indexOf(f._id);
        $scope.selUser.actions.splice(ind, 1);
        saveUser(function(){
            loadActions();
        });
    }

    $scope.manageAction = function(a){
        adminservice.setSelObj(a);
        var obj = {};
        obj.view = 'actionDetail.html';
        obj.title = "Action properties";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.loadEvents = function(){
        var filterdata = {};
        filterdata.objname = '';
        adminservice.setFilterData(filterdata);
        $scope.newEvent = {};
        $scope.newEvent.type = 'user';
        $scope.newEvent.ownerID = $scope.selUser._id;
        adminservice.listObj('event', {type:'user', ownerID: $scope.selUser._id}, $http, function(data){
           $scope.myevents = data;
        });
    }

    $scope.addEvent = function(){
        console.log('new event', $scope.newEvent);
        adminservice.saveObj($scope.newEvent, 'event', $http, function(){
            $scope.loadEvents();
        });
    }

    $scope.removeEvent = function(e){
        adminservice.deleteObj(e, 'event', $http, function(){
            $scope.loadEvents();
        });
    }

    $scope.saveEvent = function(e){
        adminservice.saveObj(e, 'event', $http, function(){

        });
    }

    $scope.$on('EV_OBJ_SELECTED', function(event, data, objname){
        if (data !== undefined){
            console.log('data picked', data);
            $scope.newEvent.dataobj = objname;
            $scope.newEvent.data = data;
            adminservice.objToString(data[0], objname, $http, function(desc){
                 $scope.newEvent.objdesc = desc;
            });
        }
    })

}