function chatprodctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.step = cartservice.currentstep();
    $scope.greeting = $scope.step.prompt;
    $scope.products = [];
    $scope.showDetail = function(p){
        if (p.openDetail == undefined){
            p.openDetail = true;
        }
        else{
            p.openDetail = !p.openDetail;
        }
        p.lblDetails = p.openDetail == true ? "Hide Details" : "More Details";
    }

    $scope.templateUrl = cartservice.getTemplateURL();



    $scope.$on("EV_PROD_SHOW", function(event, p){
        $scope.products.push(p);
        $scope.$apply();
    });

    $scope.$on("EV_PROD_HIDE", function(event, p){
        $.each($scope.products, function(i, prod){
            if (prod._id === p._id){
                $scope.products.splice(i, 1);
                $scope.$apply();
                return;
            }
        });
    });


    $scope.$on("EV_PROD_HIGHLIGHT", function(event, p){
        var product = findProduct(p);
        if (product !== null){
            product.point = p.point;
            $scope.$apply();
        }
    });

    $scope.selectProd = function(obj){
        if (obj.chosen == undefined || obj.chosen == false){
            obj.chosen = true;
        }
        else{
            obj.chosen = false;
        }

        $scope.$emit("CHAT_ACTION", 'EV_PRODUCT_SELECTED', obj);
    }

    function findProduct(p){
        var product = {}
        $.each($scope.products, function(i, prod){
            if (prod._id === p._id){
                product = prod;
                return product;
            }
        });
        return product;
    }


}
