function prodctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.emailed = false;
    $scope.emailPrompt = "EMAIL ME THE RESULTS";
    $scope.showDetail = function(p){
        if (p.openDetail == undefined){
            p.openDetail = true;
        }
        else{
            p.openDetail = !p.openDetail;
        }
        p.lblDetails = p.openDetail == true ? "Hide Details" : "More Details";
    }
    loadProds();
    $scope.templateUrl = cartservice.getTemplateURL();
    function loadProds(){
        $scope.c = cartservice.getCustomer();
        cartservice.loadproducts($scope.c, $http, function(data){
            var teaser = cartservice.getTeaserProd();
            if (teaser !== undefined && teaser !== null){
                data.splice(0, 0, teaser);
            }
            $scope.products = data;
            $.each(data, function(i, p){
                p.lblDetails = "More Details";
                cartservice.logAction("qual", 0, true, {zip:p.zip,prov:p.provider});
            });
        });
    }

    $scope.reloadProds = function(){
        cartservice.loadproducts($scope.c, $http, function(data){
            var teaser = cartservice.getTeaserProd();
            if (teaser !== undefined && teaser !== null){
                data.splice(0, 0, teaser);
            }
            $scope.products = data;
            $.each(data, function(i, p){
                p.lblDetails = "More Details";
            });
            $scope.$apply();
        });
    }

    $scope.$on("EV_LOAD_PROD", function(event){
        loadProds();
    });

    $scope.$on("EV_PRODUCT_SELECTED", function(event, obj){
        if (obj.chosen == undefined || obj.chosen == false){
            obj.chosen = true;
        }
        else{
            obj.chosen = false;
        }
    });

    $scope.addToCart = function(obj){
        $scope.$emit("EV_ADD_PROD", obj);
    }

    $scope.addToCartandNext = function(obj){
        obj.teaser = false;
        $scope.$emit("EV_ADD_PROD_NEXT", obj, $scope.c);

    }

    $scope.emailList = function(){
        if ($scope.c !== undefined && $scope.c.email !== undefined){
            console.log("product controller calls save");
        cartservice.updateCustomer();
        $scope.emailed = true;
        $scope.emailPrompt = "THE LIST HAS BEEN EMAILED TO " + $scope.c.email;
        }
    }

}
