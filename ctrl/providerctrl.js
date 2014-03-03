function providerctrl($scope, $http, adminservice){
    var OBJ = 'provider';
    var serverUrl = topUrl + adminURL + '/templ/';
    $scope.rootUrl = topUrl;
    $scope.selProvider = adminservice.getSelObj();
    if ($scope.selProvider._id !== undefined){
        $scope.tenant = adminservice.getTenant();
        var date = new Date($scope.selProvider.startDate);
        $scope.since = date.getMonth() + ' ' + date.getFullYear();
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

        showCoverage();
    }
    else{
        init();
    }

    $scope.showCoverage = function(){
        showCoverage();
    }

    $scope.loadProds = function(){
        var filterData = {}
        filterData.objname = 'product';
        filterData.f = {provider: $scope.selProvider.name};
        filterData.customfields = false;
        adminservice.setFilterData(filterData);
        $scope.prodTemplate = serverUrl + 'griddefault.html';
    }

    $scope.loadOffers = function(){
        $scope.$broadcast("EV_GRID_INIT", 'product', true);
    }

    function showCoverage(){
        $scope.center = {
            lat: 37.26531,
            lng: -80.507812,
            zoom: 5
        }
        $scope.paths = {};
            adminservice.listObj('product', {provider:$scope.selProvider.name}, $http, function(d){
                $.each(d, function(i, p){
                    $scope.paths['p' + i] = {};
                    $scope.paths['p' + i].color = '#ff612f';
                    $scope.paths['p' + i].radius = 200000;
                    $scope.paths['p' + i].type ='circle';
                    $scope.paths['p' + i].message = 'Hello';
                    adminservice.listObj("zip", {zip:p.zip}, $http, function(z){
                        if (z.length > 0){
                            var code = z[0];
                            $scope.paths['p' + i].latlngs = {lat:code.lat,lng:code.lon};
                        }
                    });

                });
        });
    }


    $scope.onProviderLogo = function(event){
        var url = event.url.replace(topUrl, "");
        $scope.selProvider.logo = url;
        if ($scope.selProvider._id !== undefined){
            saveProvider();
        }
    }

    function saveProvider(callback){
        adminservice.saveObj($scope.selProvider, 'provider', $http, function(){
            if (callback !== undefined){
                callback();
            }
        });
    }

    function init(){
        $scope.obj = adminservice.getSelObj();
        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
        });
    }

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname !== 'name' && metafld.fldname !== "desc" || metafld.fldname == "active"){
            mf = null;
        }
        return mf;
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        $scope.obj.logo = $scope.selProvider.logo;
        adminservice.saveObj($scope.obj, OBJ, $http, function(saved){
            var callback = adminservice.getSelCallback();
            if (callback !== undefined && callback !== null){
                callback(saved);
            }
        });

    });


}