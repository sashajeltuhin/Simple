function teaserctrl($scope, $rootScope, $http, $location, cartservice){

    cartservice.getSocket().on('prodviewed', function (data) {
        console.log('prodviewed called');
        console.log(data);
    });
    loadProds();
    $scope.templateUrl = cartservice.getTemplateURL();
    function loadProds(){
        $scope.c = cartservice.getCustomer();
        cartservice.loadproducts($scope.c, $http, function(data){
            $scope.products = data;

            $.each(data, function(i, p){
                p.lblDetails = "More Details";
                cartservice.logAction("qual", 0, true,  {zip:p.zip,prov:p.provider});
            });
        });
    }

    $scope.reloadProds = function(){

        cartservice.loadproducts($scope.c, $http, function(data){
            $scope.products = data;
            $.each(data, function(i, p){
                p.lblDetails = "More Details";
            });
            $scope.$apply();
        });
    }

    $scope.launch = function(obj){
        $scope.c = cartservice.getCustomer();
        if ($scope.c.zip == undefined || $scope.c.zip == ""){
            $('#bv_popup_trigger').click();
            //anonymous
            obj.teaser = true;
            $scope.teaserProd = obj;
        }
        else{
            $scope.$emit("EV_ADD_PROD_NEXT", obj, $scope.c);
        }
    }

    $scope.proceed = function(){
        $('.modal-backdrop').remove();

        $scope.$emit("EV_ADD_PROD_NEXT", $scope.teaserProd, $scope.c);
    }


}
