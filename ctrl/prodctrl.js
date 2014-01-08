function prodctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    $scope.emailed = false;
    $scope.emailPrompt = "EMAIL ME THE RESULTS";
    $scope.app = cartservice.getAppObj();
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
        var f = {};
        $scope.c = cartservice.getCustomer();
        f.customer = $scope.c;
        f.rule = "qual";
        cartservice.loadproducts(f, $http, function(data){
            var teaser = cartservice.getTeaserProd();
            if (teaser !== undefined && teaser !== null && !teaserInList(teaser, data)){
                data.splice(0, 0, teaser);
            }
            $scope.products = data;
            $.each(data, function(i, p){
                p.lblDetails = "More Details";
                cartservice.logAction("qual", 0, true, {zip:p.zip,prov:p.provider});
            });
        });
    }

    function teaserInList(teaser, data){
        var y = false;
        $.each(data, function(i, p){
            if (teaser._id === p._id){
                y = true;
            }
        });
        return y;
    }

    $scope.reloadProds = function(){
        var f = {};
        f.customer = $scope.c;
        f.rule = "qual";
        cartservice.loadproducts(f, $http, function(data){
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
