function tenantctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.selTenant = adminservice.getTenant();
    var date = new Date($scope.selTenant.startDate);
    $scope.since = date.getMonth() + ' ' + date.getFullYear();


    if ($scope.selTenant.providers == undefined){
        $scope.selTenant.providers = [];
        $scope.myproviders = [];
    }
    if ($scope.selTenant.sessionTimeout == undefined){
        $scope.selTenant.sessionTimeout = 24;
    }

    function getDummyProv(){
        var dummy = {};
        dummy._id = 0;
        dummy.name = 'Drag providers from the available list on the right';
        return dummy
    }


    loadProviders();

    $scope.onTenantLogo = function(event){
        var url = event.url.replace(topUrl, "");
        $scope.selTenant.logo = url;
        saveTenant();
    }

    $scope.onUserAvatar = function(event){
        var url = event.url.replace(topUrl, "");
        $scope.selTenant.userImageUrl = url;
        saveTenant();
    }

    $scope.loadProviders = function(){
        loadProviders();
    }

    function loadProviders(){
        $scope.availableSection = 'Providers';

        adminservice.listObj('provider', {_id: $scope.selTenant.providers}, $http, function(data){
            $scope.myproviders = data;
            if ($scope.myproviders.length == 0){
                $scope.myproviders.push(getDummyProv());
            }
        });

        var fv = {};
        fv.oper = '<>';
        fv.val = $scope.selTenant.providers;
        $scope.existingList = [];
        adminservice.listObj('provider', {_id: fv}, $http, function(data){
            $.each(data, function(i, t){
                var item = {};
                item._id = t._id;
                item.name = t.name;
                item.imageUrl = t.logo;
                $scope.existingList.push(item);
            });

        });
    }

    $scope.onAddProvider = function(list){
        var c = 0;
        $.each(list, function(i, item){
            if (item['$scope'].i !== undefined){
                $scope.selTenant.providers.push(item['$scope'].i._id);
                c++;
            }
        });
        if (c > 0){
            saveTenant(function(){
                loadProviders();
            });
        }
    }

    $scope.removeProvider = function(t){
        var ind = $scope.selTenant.providers.indexOf(t._id);
        $scope.selTenant.providers.splice(ind, 1);
        saveTenant(function(){
            loadProviders();
            if ($scope.myproviders.length == 0){
                $scope.myproviders.push(getDummyProv());
            }
        });
    }

    $scope.manageProvider = function(p){
        adminservice.setSelObj(p);
        var obj = {};
        obj.view = 'providerDetail.html';
        obj.title = "Provider Management";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function saveTenant(callback){
        adminservice.saveObj($scope.selTenant, 'tenant', $http, function(){
            if (callback !== undefined){
                callback();
            }
        });
    }

    $scope.saveObj = function(){
        saveTenant();
    }

    $scope.loadDepts = function(){
        $scope.newDept = {};
        if ($scope.selTenant.departments == undefined){
            $scope.selTenant.departments = [];
        }
    }

    $scope.addDept = function(){
        $scope.selTenant.departments.push($scope.newDept);
        saveTenant(function(){
            $scope.loadDepts();
        });
    }

    $scope.removeDept = function(d){
        for(var i = $scope.selTenant.departments.length - 1; i >=0; i--){
            if (d.name == $scope.selTenant.departments[i].name){
                $scope.selTenant.departments.splice(i, 1);
            }
        }
        saveTenant(function(){
            $scope.loadDepts();
        });
    }


}