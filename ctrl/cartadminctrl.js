function cartadminctrl($scope, $routeParams, $http, $location, cartservice){
    var serverUrl = topUrl + '/templ/';
    $scope.topUrl = topUrl;
    $scope.isAdmin = cartservice.isIn();
    $scope.scriptlabel = "Get Help...";
    $scope.scriptopen = false;
    $scope.cp = cartservice.getProdsInCart();
    $scope.c = cartservice.getCustomer();

    $scope.stats = {};
    $scope.hasproducts = false;
    $scope.existprod = false;
    $scope.showCart = false;
    $scope.templateUrl = cartservice.getTemplateURL();
    $scope.carttotal = cartservice.cartTotal();
    $scope.step = cartservice.currentstep();
    cartservice.setAdmin(true);

    $scope.previewStep = getURLParameter('step');
    $scope.previewMode = getURLParameter('preview');
    $scope.tenant = getURLParameter('tenant');
    var iud = getURLParameter('uid');
    cartservice.setAgentID(iud);

    var appID = getURLParameter('app');
    if (appID !== undefined){
        cartservice.setAppID(appID);
    }

    console.log("route params:", $routeParams);

    if ($scope.previewStep !== undefined){
        cartservice.setSingleTempl($scope.previewStep);
    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }

    $scope.start = function(z, cust, appType, extension, prod, exCart){
        if ($scope.tenant !== undefined){
            appType = $scope.tenant;
        }
        $scope.wrapperUrl = serverUrl + 'adminTmpl.html';
        cust.zip = z;
        cartservice.setExCart(exCart);
        cartservice.setExtension(extension);
//        if (cartservice.exCartExists() == false){
//            $('#bv_cart_panel').show();
//        }
//        else
//        {
//            $('#bv_cart_panel').hide();
//        }
        cartservice.initCartPanel({name:'cart', app:appType}, $http, function(c){
            $scope.showCart = c.visible;

        });
        $scope.stats.orders = 0;
        $scope.stats.calltime = 0;
        $scope.stats.rev = 0;
        $scope.stats.conv = 0.0;
        $scope.stats.ladder = {};
        cartservice.initGame({name:'game', app:appType}, $http, function(game){
            $scope.gameOn = game.visible;
            if ($scope.gameOn){
                $scope.gamePanel = game;
                updateStats();
            }
        });
        var f = {zip:z, agent:'consumer'};
        $scope.ex = prod;
        $scope.existprod = $scope.ex!= null && $scope.ex != undefined;
        var stepFilter = {visible:true, order_by:{order:1}};
        if ($scope.previewStep == undefined){
            stepFilter.type = 'cart';
        }
        console.log("stepFilter", stepFilter);
        cartservice.initsteps(f, cust, appType, stepFilter, $http, function(steps){
            $scope.steps = steps;
            $scope.step = cartservice.currentstep();
            $scope.c = cartservice.getCustomer();
            $scope.appcss = cartservice.getAppObj().cssurl;

            $scope.changeView($scope.step);


        });

        cartservice.initCrumbs({name:'crumb'}, $http, function(cr){
            $scope.crumbsOn = cr.visible;
        });
        updateCartTotal();

    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }
    $scope.isActiveStep = function(s){
        var active = false;
        if (s !== undefined && $scope.step !== undefined && s._id == $scope.step._id){
            active = true;
        }
        return active;
    }

    $scope.restart = function(){
        $scope.start($scope.c.zip, $scope.c, $scope.tenant, false);
    }

    $scope.pickStep = function(w){
        cartservice.setCurrentStep(w._id);
        $scope.step = cartservice.currentstep();
        $scope.changeView($scope.step);
    }

    $scope.back = function(){

        $scope.step = cartservice.prevStep($scope.step._id);
        $scope.changeView($scope.step);
    }

    $scope.next = function(){
        $scope.step = cartservice.nextStep($scope.step._id);
        $scope.changeView($scope.step);
    }


    $scope.changeView = function (step){
        $location.path('/' + step._id);
//        var fn = window[step.controller];
//        $scope.viewCtrl = fn;
//        if ($scope.wrapperUrl == undefined){
//         $scope.wrapperUrl = serverUrl + 'adminTmpl.html';
//        }
        $scope.templateUrl = cartservice.getTemplateURL();
        onStep(step, $scope.c);
    }

    $scope.loadProds = function(){
        $scope.$broadcast("EV_LOAD_PROD");
    }

    $scope.clear = function (){
        $scope.changeView('');
        cartservice.endSession();
    }

    $scope.openAdmin = function(){
        $('#bv_cart_panel').hide();
        var p = $scope.isAdmin == true? '/admin' : '/';
        $location.path(p);
    }
    $scope.openCart = function(){
        if (cartservice.exCartExists() == false){
        $('#bv_cart_panel').show();
        }
    }

    $scope.onAuth = function(){
        var c = cartservice.isIn();
        cartservice.setAdmin(!c);
        $scope.isAdmin = cartservice.isIn();
        $scope.login = $scope.isAdmin == true ? "Sign Out" : "Sign In";
    }

    function updateCartTotal(){
        $scope.cp = cartservice.getProdsInCart();
        $scope.hasproducts = $scope.cp !== undefined && $scope.cp.length > 0;
        $scope.carttotal = $scope.ex.price;

        $.each($scope.cp, function(i, p){
            $scope.carttotal = Number(Number($scope.carttotal) + Number(p.priceNow)).toFixed(2);
            if (p.rebate !== undefined){
                $scope.carttotal = Number($scope.carttotal - Number(p.rebate)).toFixed(2);
            }
        });
        cartservice.updateTotal($scope.carttotal);
//        $scope.$apply();
    }

    $scope.$on("EV_ADD_PROD", function(event, obj){
        cartservice.addProduct(obj);
        if (cartservice.exCartExists()){
            cartservice.added = $('<div class="row"><div class="span2">' + obj.title + '</div><div class="span1">' + obj.priceNow + '</div></div>').appendTo(cartservice.getExCart());
            cartservice.added.click(function(){
                cartservice.delProduct(obj);
                cartservice.added.remove();
            });
        }
        else{
            updateCartTotal();
        }
    });

    $scope.$on("EV_ADD_PROD_NEXT", function(event, obj, c){
        if (obj.teaser == true){
            cartservice.setTeaserProd(obj);
        }
        else{
            cartservice.addProduct(obj);
            updateCartTotal();
        }
        if (c!==undefined){
            cartservice.setCustomer(c);
            cartservice.updateCustomer(function(){

                $scope.next();
            });
        }
        else{
            $scope.next();
        }
    });

    $scope.removeProd = function(obj){
        cartservice.delProduct(obj);
        if (cartservice.exCartExists() &&  cartservice.added !== undefined){
            cartservice.added.remove();
        }
        else{
        updateCartTotal();
        }
    }

    $scope.openScript = function(){
        $scope.scriptopen = !$scope.scriptopen;
        $scope.scriptlabel = $scope.scriptopen == false ? "Get Help..." : "Close";
    }

    function updateStats(){

        cartservice.standings({}, $http, function(res){
//            for (var i = 0; i < res.length; i++){
//                var s = res[]
//            }
            $scope.stats.ladder = res;

        });
        var f = {app:cartservice.getApp()};
        cartservice.totalOrders(f, $http, function(res){
            $scope.stats.orders = res.length > 0 ?  Number(res[0].result) : 0;
        });

        cartservice.callTime(f, $http, function(res){
            $scope.stats.calltime = res.length > 0 ?  Number(res[0].result).toFixed(2) : 0;

        });

//        cartservice.totalRev(f, $http, function(res){
//            $scope.stats.rev = res.length > 0 ?  Number(res[0].result).toFixed(2) : 0;
//            $scope.$apply();
//        });

        cartservice.convRate(f, $http, function(res){
            $scope.stats.conv = Number(res.result).toFixed(2);

        });
    }
}

function onStep(step){

}

function getPerson(){

    return {};
}
