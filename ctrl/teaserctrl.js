function teaserctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.step = cartservice.currentstep();
    $scope.app = cartservice.getAppObj();
//    cartservice.getSocket().on('prodviewed', function (data) {
//        console.log('prodviewed called');
//        console.log(data);
//    });
    loadProds();
    $scope.templateUrl = cartservice.getTemplateURL();
    function loadProds(){
        var f = {};
        $scope.c = cartservice.getCustomer();
        f.customer = $scope.c;
        f.rule = "teas";
        cartservice.loadproducts(f, $http, function(data){
            $scope.products = data;

            $.each(data, function(i, p){
                p.lblDetails = "More Details";
                cartservice.logAction("qual", 0, true,  {zip:p.zip,prov:p.provider});
            });
        });
    }

    $scope.reloadProds = function(){
        var f = {};
        f.customer = $scope.c;
        f.rule = "teas";
        cartservice.loadproducts(f, $http, function(data){
            $scope.products = data;
            $.each(data, function(i, p){
                p.lblDetails = "More Details";
            });
            $scope.$apply();
        });
    }

    $scope.launch = function(obj){
        $scope.c = cartservice.getCustomer();
        if ($scope.c.selectedCat == undefined){
            $scope.c.selectedCat = [];
        }
        if (obj.type !== undefined && $scope.c.selectedCat.indexOf(obj.type)){
            $scope.c.selectedCat.push(obj.type);
            cartservice.updateCustomer();
        }
        if ($scope.c.zip == undefined || $scope.c.zip == ""){
            $('#bv_popup_trigger').click();
            //anonymous
            obj.teaser = true;
            $scope.teaserProd = obj;
            if (cartservice.isIn()){
                $scope.$emit("EV_ADD_PROD_NEXT", obj, $scope.c);
            }
        }
        else{
            $scope.$emit("EV_ADD_PROD_NEXT", obj, $scope.c);
        }
    }

    $scope.launchNext = function(obj){
        $scope.c = cartservice.getCustomer();
        if ($scope.c.zip == undefined || $scope.c.zip == ""){
            $('#bv_popup_trigger').click();
            //anonymous
            obj.teaser = true;
            $scope.teaserProd = obj;
        }

        $scope.$emit("EV_ADD_PROD_NEXT", obj, $scope.c);

    }

    $scope.proceed = function(){
        $('.modal-backdrop').remove();

        $scope.$emit("EV_ADD_PROD_NEXT", $scope.teaserProd, $scope.c);
    }

}
