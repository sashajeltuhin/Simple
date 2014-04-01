function agentctrl($scope, $rootScope, $http, $location, cartservice, adminservice){
    var serverUrl = topUrl + '/templ/';
    $scope.topUrl = topUrl;
    $scope.leftbarshow = true;

    $scope.isAdmin = cartservice.isIn();
    $scope.scriptlabel = "Get Help...";
    $scope.scriptopen = false;
    $scope.cp = cartservice.getProdsInCart();
    $scope.c = cartservice.getCustomer();

    $scope.stats = {};
    $scope.allwidgets = [];
    $scope.hasproducts = false;
    $scope.existprod = false;
    $scope.showCart = false;
    $scope.templateUrl = cartservice.getTemplateURL();
    $scope.carttotal = cartservice.cartTotal();
    $scope.step = cartservice.currentstep();
    //cartservice.setAdmin(true);

    console.log("Controller init. step: " + $scope.step.name);

    console.log("Controller init. Customer:");
    console.log($scope.c);

    $scope.tenant = getURLParameter('tenant');
    var sid = getURLParameter('session');
    console.log("session", sid);

    cartservice.validateAgent(sid, $scope.tenant, function(a, s){
        if (a == null){
            //login
        }else{
            $scope.agent = a;
            $scope.session = s;
            adminservice.listObj('tenant', {name:$scope.tenant}, $http, function(t){
                if (t.length > 0){
                    $scope.selTen = t[0];
                    adminservice.setTenant(t[0]);
                    adminservice.listObj('apps', {tenant:$scope.selTen.name}, $http, function(apps){
                        $scope.selTen.appObjects = apps;
                        $scope.switchApp(apps[0]);
                    });

                }
            });
        }
    });

    function loadStats(){
        var filter = {agent: $scope.agent._id, complete:true, action:'call_end'};
        var groups = [];
        groups.push({fldid:"_id", fldname:"agent"});
        groups.push({fldid:"result", fldname: "duration", fnc:"avg"});
        adminservice.compute('log', filter, groups,$http, function(data){
            console.log("duration report", data[0].result);
        });
    }

    $scope.switchApp = function(a){
        $scope.selApp = a;
        $scope.selApp.agent = "agent"; //any flow can be used in call center
        cartservice.setAppObj(a);
        loadWidgets();
        loadStats();
    }

    function prepareField(metafld){
        var mf = metafld;

        return mf;
    }

    function loadWidgets(){
        adminservice.listObj('step', {app:'admin', type:'app', parentid:'agentnav', visible:true, order_by:{order:1}}, $http, function(data){
            $scope.agentWidgets = data;
            $.each(data, function(i, w){
                initWidget(w);
            });
            $scope.restart();
        });
        adminservice.listObj('step', {app:'admin', type:'app', parentid:'agenttools', visible:true, order_by:{order:1}}, $http, function(data){
            $scope.agentTools = data;
            $.each(data, function(i, w){
                initWidget(w);
            });
        });
    }

    function initWidget(w){
        adminservice.cacheWidget(w);
        $scope.allwidgets.push(w);
        w.view = $scope.topUrl +  w.template;
        w.show = true;
        if (w.integration !== undefined && w.integration !== ''){
            eval(w.integration);
        }
    }

    $scope.isActiveStep = function(s){
        var active = false;
        if (s !== undefined && $scope.step !== undefined && s._id == $scope.step._id){
            active = true;
        }
        return active;
    }

    $scope.restart = function(){
        $scope.c = {};
        $scope.c.agentID = $scope.agent._id;
        $scope.start($scope.c.zip, $scope.c, $scope.tenant, false);
    }


    $scope.start = function(z, cust, appType, extension, prod, exCart){
        $scope.wrapperUrl = serverUrl + 'adminTmpl.html';
        cust.zip = z;
        cartservice.setExCart(exCart);
        cartservice.setExtension(extension);

        $scope.stats.orders = 0;
        $scope.stats.calltime = 0;
        $scope.stats.rev = 0;
        $scope.stats.conv = 0.0;
        $scope.stats.ladder = {};

        var f = {zip:z, agent:'agent'};
        $scope.ex = prod;
        $scope.existprod = $scope.ex!= null && $scope.ex != undefined;
        cartservice.initsteps(f, cust, appType, {type:'cart', visible:true, order_by:{order:1}}, $http, function(steps){
            $scope.steps = steps;
            $scope.step = cartservice.currentstep();
            $scope.c = cartservice.getCustomer();
            $scope.$broadcast("EV_CONSUMER_CHANGED", $scope.c);
            $scope.onair = true;
            $scope.changeView(steps[0]);
        });


        updateCartTotal();
        cartservice.getSocket().on('feedback', function (action) {
                console.log("client feedback:");
                console.log(action);
                if (action.name == 'iam'){
                    $scope.c = cartservice.getCustomer();
                    for(var key in action.obj){
                        $scope.c[key] = action.obj[key];
                    }
                    cartservice.setCustomer($scope.c);
                    cartservice.updateCustomer(function(c){
                        $scope.c = cartservice.getCustomer();
                        //$scope.$apply();
                    });
                }
            if (action.name == 'EV_PRODUCT_SELECTED'){
                console.log("client calls :" +  action.name);
                $scope.$broadcast(action.name, action.obj);
            }
        });

    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }

    $scope.$on("EV_LAUNCH_EVENT", function(event, data){
        if (data !== undefined && data.length > 0){
            var prospect = data[0];
            crossRef(prospect);

            //if rec is a lead, use it, otherwise copy fields into the new record and cross reference ids)
            $scope.startCall(prospect);
        }
    });

    $scope.startCall = function(prospect){
        cartservice.setCustomer($scope.c);
        cartservice.updateCustomer(function(){
            $scope.$broadcast("EV_CONSUMER_CHANGED", $scope.c);
            checkOnline(function(){
                if (prospect !== undefined){
                    $scope.next();
                }
            })
        });
    }

    //look up TFN to associate the online session
    function checkOnline(callback){
        if ($scope.c.tfn !== undefined && $scope.c.tfn.length > 0){
            adminservice.listObj('consumer', {tfn: $scope.c.tfn, agentID: ""}, $http, function(c){
                if (c.length > 0){
                    var onlineSession = c[0];
                    crossRef(onlineSession);
                }
                $scope.$broadcast("EV_CONSUMER_CHANGED", $scope.c);
                callback();

            });
        }
        else{
            callback();
        }
    }

    function crossRef(onlineSession){
        for(var key in onlineSession){
            if (key !== "agentID" && key !== '_id'){
                $scope.c[key] = onlineSession[key];
            }
        }
        $scope.c.refID = onlineSession._id;
    }

    $scope.startChat = function(){
        var o = {};
        o.tenant = $scope.tenant;
        o.agent = $scope.agent;
        cartservice.getSocket().emit('agenttalk', buildChatAction('welcome', o));
    }


    $scope.back = function(){
        $scope.step = cartservice.prevStep($scope.step._id);
        $scope.changeView($scope.step);
    }

    $scope.next = function(){
        //check success in app object
        //check validation before proceeding
        $scope.areademo = cartservice.getGeo();
        formatGeo($scope.areademo);
        $scope.step = cartservice.nextStep($scope.step._id);
        $scope.changeView($scope.step);
    }


    $scope.changeView = function (step){
        $location.path('/app/' + step._id);

        $scope.templateUrl = cartservice.getTemplateURL();
        onStep(step, $scope.c);
    }

    $scope.$on("EV_CONSUMER_UPDATED", function(event, obj){
        $scope.c = obj;
        console.log('EV_CONSUMER_UPDATED called', $scope.c);
        cartservice.setCustomer($scope.c);
    });



    $scope.loadProds = function(){
        $scope.$broadcast("EV_LOAD_PROD");
    }

    $scope.clear = function (){
        $scope.changeView('');
        cartservice.endSession();
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
        //$scope.carttotal = $scope.ex !== undefined && $scope.ex.price !== undefined ? $scope.ex.price : 0;
        $scope.carttotal = {};
        $scope.carttotal.once = 0;
        $scope.carttotal.rec = 0;
        $scope.cartfees = [];
        $scope.cartadons = [];
        $scope.cartrebates = [];
        if ($scope.hasproducts){
            for(var i = 0; i < $scope.cp.length; i++) {
                var p = $scope.cp[i];
                var recprice = p.priceNow == undefined ? 0 : Number(p.priceNow);
                var onceprice = p.installPrice == undefined ? 0 : Number(p.installPrice);
                p.recshow = recprice > 0 ? true : false;
                p.oneshow = onceprice > 0 ? true : false;
                $scope.carttotal.once = Number(Number($scope.carttotal.once) + Number(onceprice)).toFixed(2);
                $scope.carttotal.rec = Number(Number($scope.carttotal.rec) + Number(recprice)).toFixed(2);
                calculateFees(p);
                if (p.bundles !== undefined){
                    for(var b = 0; b < p.bundles.length; b++){
                        var adon = p.bundles[b];
                        var recad = adon.priceNow == undefined ? 0 : Number(adon.priceNow);
                        var oncead = adon.installPrice == undefined ? 0 : Number(adon.installPrice);
                        adon.recshow = recad > 0 ? true : false;
                        adon.oneshow = oncead > 0 ? true : false;
                        $scope.carttotal.once = Number(Number($scope.carttotal.once) + Number(oncead)).toFixed(2);
                        $scope.carttotal.rec = Number(Number($scope.carttotal.rec) + Number(recad)).toFixed(2);
                        $scope.cartadons.push(adon);
                        calculateFees(adon);
                    }
                    p.showbundles = p.bundles.length > 0;
                }
                else{
                    p.bundles = [];
                    p.showbundles = false;
                }
    //            $scope.carttotal = Number(Number($scope.carttotal) + Number(p.priceNow)).toFixed(2);
    //            if (p.rebate !== undefined){
    //                $scope.carttotal = Number($scope.carttotal - Number(p.rebate)).toFixed(2);
    //            }
            }
            cartservice.updateTotal($scope.carttotal);
        }
//        $scope.$apply();
    }

    function calculateFees(p){
        if (p.fees !== undefined){

            for(var f = 0; f < p.fees.length; f++){
                var fee = p.fees[f];
                var recfee = fee.priceNow == undefined ? 0 : Number(fee.priceNow);
                var oncefee = fee.installPrice == undefined ? 0 : Number(fee.installPrice);
                fee.oneshow = oncefee > 0 ? true : false;
                fee.recshow = recfee > 0 ? true : false;

                $scope.carttotal.once = Number(Number($scope.carttotal.once) + Number(oncefee)).toFixed(2);
                $scope.carttotal.rec = Number(Number($scope.carttotal.rec) + Number(recfee)).toFixed(2);
                $scope.cartfees.push(fee);
            }
            p.showfees = p.fees.length > 0;
        }
        else{
            p.fees = [];
            p.showfees = false;
        }

        if (p.rebates !== undefined){
            for(var f = 0; f < p.rebates.length; f++){
                var reb = p.rebates[f];
                var recreb = reb.priceNow == undefined ? 0 : Number(reb.priceNow);
                var oncereb = reb.installPrice == undefined ? 0 : Number(reb.installPrice);
                reb.oneshow = oncereb > 0 ? true : false;
                reb.recshow = recreb > 0 ? true : false;
                $scope.carttotal.once = Number(Number($scope.carttotal.once) - Number(oncereb)).toFixed(2);
                $scope.carttotal.rec = Number(Number($scope.carttotal.rec) - Number(recreb)).toFixed(2);
                $scope.cartrebates.push(reb);
            }
            p.showrebs = p.rebates.length > 0;
        }
        else{
            p.rebates = [];
            p.showrebs = false;
        }
    }

    function buildChatAction(title, obj){
        var action = {};
        action.name = title;
        action.obj = obj;
        action.app = cartservice.getApp();
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

    $scope.toggleLeft = function(){
        if ($scope.leftbarshow == true){
            $scope.leftbarshow = false;
        }
        else{
            $scope.leftbarshow = true;
        }
    }

    function onStep(step){

    }


    function getPerson(){
        return {};
    }

    function formatGeo(obj){

        if (obj){
            obj.homevalue_formatted = Number(obj.homevalue).formatMoney(2);
            obj.income_formatted = Number(obj.income).formatMoney(2);
            obj.medianrent_formatted = Number(obj.medianrent).formatMoney(2);
            obj.unemployment_formatted = Number(obj.unemployment).formatMoney(2);
        }
    }
}



