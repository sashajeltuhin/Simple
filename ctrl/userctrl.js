function userctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.selUser = adminservice.getSelUser();
    if ($scope.selUser._id !== undefined){
        var date = new Date($scope.selUser.startDate);
        $scope.since = date.getMonth() + ' ' + date.getFullYear();

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

    function saveUser(callback){
        adminservice.saveObj($scope.selUser, 'user', $http, function(d){
            $scope.selUser = d;
            if (callback !== undefined){
                callback();
            }
        });
    }

    $scope.openNewUser = function(){
        adminservice.setSelUser({});
        var obj = {};
        obj.view = 'createUser.html';
        obj.title = "User Management";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.createUser = function(){
        $scope.selUser.tenant = adminservice.getTenant().name;
        $scope.selUser.tid = adminservice.getTenant()._id;
        $scope.selUser.tenants = [];
        $scope.selUser.tenants.push($scope.selUser.tid);
        $scope.selUser.startDate = new Date();
        saveUser(function(){
            adminservice.setSelUser($scope.selUser);
            var obj = {};
            obj.view = 'adminprofile.html';
            obj.title = "User Management";
            $scope.$emit("EV_SWITCH_VIEW", obj);
        });
    }
}