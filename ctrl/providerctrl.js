function providerctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    $scope.selProvider = adminservice.getSelObj();
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

    $scope.showCoverage = function(){
        showCoverage();
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
        saveProvider();
    }

    function saveProvider(callback){
        adminservice.saveObj($scope.selProvider, 'provider', $http, function(){
            if (callback !== undefined){
                callback();
            }
        });
    }


}