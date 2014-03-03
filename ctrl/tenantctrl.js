function tenantctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    var sel = adminservice.getSelObj();
    if (sel !== undefined ){
        if (sel.tid != undefined){
            delete sel.tid;
            $scope.obj = sel;
            adminservice.loadMeta('tenant', $http, function(meta){
                $scope.propsEl = adminservice.buildForm(meta, null, $scope.obj);
            });
        }
        else{
            $scope.selTenant = sel;
        }

    }
    else{
        $scope.selTenant = adminservice.getTenant();
    }

    if ($scope.selTenant !== undefined){
        if ($scope.selTenant.startDate !== undefined){
            var date = new Date($scope.selTenant.startDate);
            $scope.since = date.getMonth() + ' ' + date.getFullYear();
        }


        if ($scope.selTenant.providers == undefined){
            $scope.selTenant.providers = [];
            $scope.myproviders = [];
        }

        if ($scope.selTenant.sessionTimeout == undefined){
            $scope.selTenant.sessionTimeout = 24;
        }
        var cTime = new Date(), month = cTime.getMonth()+1, year = cTime.getFullYear();
        $scope.events = [
            [
                "5/"+month+"/"+year,
                'Meet a friend',
                '#',
                '#fb6b5b',
                'Contents here'
            ],
            [
                "8/"+month+"/"+year,
                'Kick off meeting!',
                '#',
                '#ffba4d',
                'Have a kick off meeting with .inc company'
            ],
            [
                "18/"+month+"/"+year,
                'Milestone release',
                '#',
                '#ffba4d',
                'Contents here'
            ],
            [
                "19/"+month+"/"+year,
                'A link',
                'https://github.com/blog/category/drinkup',
                '#cccccc'
            ]
        ];
    }

    function getDummyProv(){
        var dummy = {};
        dummy._id = 0;
        dummy.name = 'Drag from the available list on the right';
        return dummy;
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

    $scope.loadActions = function(){
        loadActions();
    }

    function loadActions(){
        $scope.existingMap = {};
        $scope.existingActs = [];
        $scope.myactions = [];

        $scope.availableSection = 'Actions';

        adminservice.listObj('action', {tid: $scope.selTenant._id}, $http, function(data){
            $scope.myactions = data;
            if ($scope.myactions.length == 0){
                $scope.myactions.push(getDummyProv());
            }

            var ids = [];
            $.each($scope.myactions, function(i, a){
                ids.push(a.name);
            });
            var f = {};
            f.tid = "0";

            if (ids.length > 0){
                var fv = {};
                fv.oper = '<>';
                fv.val = ids;
                f.name = fv;
            }

            adminservice.listObj('action', f, $http, function(data){
                $.each(data, function(i, t){
                    $scope.existingMap[t._id] = t;
                    var item = {};
                    item._id = t._id;
                    item.name = t.label;
                    item.imageUrl = t.imageUrl;
                    $scope.existingActs.push(item);
                });
            });
        });
    }

    $scope.onAddAction = function(list){
        console.log("action list", list);
        $.each(list, function(i, item){
            if (item['$scope'].a !== undefined && item['$scope'].a._id !== 0){
                var action = $scope.existingMap[item['$scope'].a._id];
                if (action !== undefined){
                    var clone = adminservice.cloneObj(action);
                    clone.tid = $scope.selTenant._id;
                    console.log("saving clone", clone);
                    adminservice.saveObj(clone, 'action', $http, function(){
                        if (i + 1 == list.length){
                            loadActions();
                        }
                    });
                }
            }
        });
    }

    $scope.manageAction = function(a){
        adminservice.setSelObj(a);
        var obj = {};
        obj.view = 'actionDetail.html';
        obj.title = "Action properties";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.removeAction = function(a){
        adminservice.deleteObj(a, 'action', $http, function(){
            loadActions();
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

    $scope.saveNewObj = function(){

        adminservice.saveObj($scope.selTenant, 'tenant', $http, function(saved){
            var u = adminservice.getSelUser();
            u.tenants.push(saved);
            $scope.editTenant(saved);
        });
    }

    $scope.openNew = function(){
        var t = {};
        t.tid = 0;
        adminservice.setSelObj(t);
        var obj = {};
        obj.view = 'createTenant.html';
        obj.title = "New Tenant";
        obj.toolbar = "secTools.html";
        $scope.$emit("EV_SWITCH_VIEW", obj);
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

    $scope.addLang = function(){
        $scope.selTenant.languages.push($scope.newLang);
        saveTenant(function(){
            $scope.loadLanguages();
        });
    }

    $scope.loadLanguages = function(){
        $scope.newLang = {};
        if ($scope.selTenant.languages == undefined){
            $scope.selTenant.languages = [];
        }
    }

    $scope.removeLang = function(l){
        for(var i = $scope.selTenant.languages.length - 1; i >=0; i--){
            if (l.name == $scope.selTenant.languages[i].name){
                $scope.selTenant.languages.splice(i, 1);
            }
        }
        saveTenant(function(){
            $scope.loadLanguages();
        });
    }

    $scope.onLangFlag = function(event, l){
        var url = event.url.replace(topUrl, "");
        l.imageUrl = url;
        if (l.name !== undefined){
            saveTenant();
        }
    }

    $scope.loadCustomFields = function(){
        var f = {};
        f.tenant = $scope.selTenant.name;
        f.custom = true;
        f.order_by = {label:1};
        adminservice.listObj('fields', f, $http, function(d){
            $scope.customFields = d;
        });
    }


    $scope.newField = function(){
        var f = {};
        f.tenant = $scope.selTenant.name;
        f.custom = true;
        adminservice.setSelObj(f, backToTenant);
        var obj = {};
        obj.view = 'fieldDetail.html';
        obj.title = "New Custom Attribute";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.removeField = function(f){
        for(var i = $scope.customFields.length - 1; i >=0; i--){
            if (f._id == $scope.customFields[i]._id){
                $scope.customFields.splice(i, 1);
            }
        }
        adminservice.deleteObj(f, 'fields', $http, function(){
            $scope.loadCustomFields();
            //need to remove block
        });
    }

    function backToTenant(obj){

    }

//    $scope.newApp = function(){
//        var f = {};
//        f.tenant = $scope.selTenant.name;
//        adminservice.setSelObj(f, backToTenant);
//        var obj = {};
//        obj.view = 'appDetail.html';
//        obj.title = "New Application";
//        $scope.$emit("EV_SWITCH_VIEW", obj);
//    }
//
//    $scope.editApp = function(a){
//        adminservice.setSelObj(a, backToTenant);
//        var obj = {};
//        obj.view = 'appDetail.html';
//        obj.title = "Edit " + a.title;
//        $scope.$emit("EV_SWITCH_VIEW", obj);
//    }
//
//    $scope.removeApp = function(a){
//        for(var i = $scope.selTenant.appObjects.length - 1; i >=0; i--){
//            if (l.name == $scope.selTenant.appObjects[i].name){
//                $scope.selTenant.appObjects.splice(i, 1);
//            }
//        }
//        saveTenant(function(){
//            $scope.loadLanguages();
//        });
//    }

    $scope.updateApp = function(app){
        adminservice.saveObj(app, 'apps', $http, function(){

        });
    }

    $scope.newProvider = function(){
        var f = {};
        adminservice.setSelObj(f, backToTenant);
        var obj = {};
        obj.view = 'newProvider.html';
        obj.title = "New Provider";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }
}