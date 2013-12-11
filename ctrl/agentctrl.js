function agentctrl($scope, $rootScope, $http, $location, cartservice){
    var serverUrl = topUrl + '/templ/';
    $scope.topUrl = topUrl;
    $scope.title = "Cart";
    $scope.login = "Sign In";
    $scope.head = "Bundles by Bridgevine";
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

    console.log("Controller init. step: " + $scope.step.name);

    console.log("Controller init. Customer:");
    console.log($scope.c);

    $scope.tenant = getURLParameter('tenant');
    $scope.agent = getURLParameter('agent');

    cartservice.listObj('fields', {objname:'consumer'}, $http, function(meta){
        $scope.propsEl = buildForm(meta);
    });

    $scope.start = function(z, cust, appType, extension, prod, exCart){
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
        var f = {zip:z, agent:'agent'};
        $scope.ex = prod;
        $scope.existprod = $scope.ex!= null && $scope.ex != undefined;
        cartservice.initsteps(f, cust, appType, {type:'cart', visible:true, order_by:{order:1}}, $http, function(steps){
            $scope.steps = steps;
            $scope.step = cartservice.currentstep();
            $scope.c = cartservice.getCustomer();


            $scope.changeView(steps[0]);
        });

        cartservice.initCrumbs({name:'crumb'}, $http, function(cr){
            $scope.crumbsOn = cr.visible;
        });
        updateCartTotal();
        cartservice.getSocket().on('feedback', function (action) {
                console.log("client feedback:");
                console.log(data);
                if (data.action == 'iam'){
                    $scope.c = cartservice.getCustomer();
                    for(var key in data.obj){
                        $scope.c[key] = data.obj[key];
                    }
                    cartservice.updateCustomer();
                }
            if (action.name == 'EV_PRODUCT_SELECTED'){
                $scope.$broadcast(action.name, action.obj);
            }
        });

    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }

    $scope.startCall = function(){
        $scope.c = $scope.obj;
        $scope.start($scope.c.zip, $scope.c, $scope.tenant, false);
    }

    $scope.startChat = function(){
        var o = {};
        o.tenant = $scope.tenant;
        o.agent = $scope.agent;
        cartservice.getSocket().emit('agenttalk', buildChatAction('welcome', o));
    }



    function buildobj(meta, def){
        var that = this;
        var obj = {};
        $.each(meta, function(i, key){
            obj[key.fldname] = def!==undefined && def[key.fldname] !== undefined ? def[key.fldname] : key.defval;
        });
        return obj;
    }

    function buildForm(meta){
        var top = $('<div></div>');
        for(var key in meta){
            var metafld = meta[key];
            if (metafld.editable == true){
                var block = $('<div class="control-group"><label class="control-label">' + metafld.label + '</label></div>').appendTo(top);
                var w =  $('<div class="controls"></div>').appendTo(block);
                var inputtype = 'text';
                switch (metafld.fldtype){
                    case 'bool':
                        inputtype = 'checkbox';
                        break;
                    case 'longtext':
                        inputtype = 'textarea';
                        break;
                }
                var cls = 'mk_fld';
                var atts = '';

                if(metafld.opts !== undefined && metafld.opts.length > 0){
                    var sel = $('<select ng-model="obj.' + metafld.fldname + '"></select>').appendTo(w);
                    $.each(metafld.opts, function(i, o){
                        var optval = metafld.optfld !== undefined ? o[metafld.optfld] : o;
                        sel.append('<option value="' + optval + '">'+ optval +'</option>');
                    });
                }
                else{
                    var ed = inputtype == 'textarea' ? '<textarea ng-model="obj.' + metafld.fldname + '" ></textarea>': '<input type="' + inputtype + '" ng-model="obj.' + metafld.fldname + '" class="' + cls + '" ' + atts + '>';
                    var ctrl = $(ed).appendTo(w);
                }
            }
        }
        return top.html();
    }


    $scope.back = function(){

        $scope.step = cartservice.prevStep($scope.step.name);
        $scope.changeView($scope.step);
    }

    $scope.next = function(){
        console.log("Controller next(). Customer:");
        console.log($scope.c);
        $scope.step = cartservice.nextStep($scope.step.name);
        $scope.changeView($scope.step);
    }

    $scope.updateCrumbs = function(s){
        if($scope.step.name == s.name){
            return "activeStep";
        }
        return "";
    }


    $scope.changeView = function (step){
        $location.path('/' + step.name);
//        var fn = window[step.controller];
//        $scope.viewCtrl = fn;
//        if ($scope.wrapperUrl == undefined){
//         $scope.wrapperUrl = serverUrl + 'adminTmpl.html';
//        }
//        $scope.templateUrl = cartservice.getTemplateURL();
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
        $scope.carttotal = $scope.ex !== undefined && $scope.ex.price !== undefined ? $scope.ex.price : 0;

        $.each($scope.cp, function(i, p){
            $scope.carttotal = Number(Number($scope.carttotal) + Number(p.priceNow)).toFixed(2);
            if (p.rebate !== undefined){
                $scope.carttotal = Number($scope.carttotal - Number(p.rebate)).toFixed(2);
            }
        });
        cartservice.updateTotal($scope.carttotal);
//        $scope.$apply();
    }

    function buildChatAction(title, obj){
        var action = {};
        action.name = title;
        action.obj = obj;
        return action;
    }

    $scope.highlight = function(p){
        if (p.point == undefined || p.point == false){
            p.point = true;
        }
        else{
            p.point = false;
        }
        cartservice.getSocket().emit('agenttalk', buildChatAction('EV_PROD_HIGHLIGHT', p));
    }

    $scope.reveal = function(p){
        if (p.visible == undefined || p.visible == false){
            p.visible = true;
        }
        else{
            p.visible = false;
        }
        var action = p.visible ? 'EV_PROD_SHOW' : 'EV_PROD_HIDE';
        cartservice.getSocket().emit('agenttalk', buildChatAction(action, p));
    }

    $scope.$on("EV_ADD_PROD", function(event, obj){
        cartservice.addProduct(obj);
        cartservice.getSocket().emit('agenttalk', buildChatAction('EV_ADD_PROD', obj));
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
            cartservice.getSocket().emit('agenttalk', buildChatAction('EV_ADD_PROD_NEXT', obj));
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
        cartservice.getSocket().emit('agenttalk', buildChatAction('removeProd', obj));
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

