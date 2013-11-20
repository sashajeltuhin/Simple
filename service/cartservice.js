angular.module('cart').factory('cartservice', function($http) {

    var service = {};
    var request = {};
    var admin = false;
    var steps = [];
    var stepNames = [];
    var curstep = '';
    var game = {};
    var cp = {};
    var crumb = {};
    var cart = null;
    var appType = '';
    var serverUrl = 'http://localhost';
    var exCart = null;
    var extenstion = false;
    service.customer = {};
    var localCart = {};
    var tenant = '';
    var appObj = {};
    var singleTempl = "";
    var teaserProd = null;

    service.getSocket = function(){
        return service.socket;
    }

    service.setExCart = function(ec){
        exCart = ec;
    }

    service.setExtension = function(ex){
        extenstion = ex;
    }

    service.setSingleTempl = function(t){
        singleTempl = t;
    }

    service.setAppObj = function(a){
        appObj = a;
        console.log(appObj);
    }

    service.getTemplateURL = function(){
        if (this.currentstep() == ''){
            return '';
        }
        if (extenstion == true){
            return chrome.extension.getURL('templ/' + this.currentstep().template);
        }
        return 'templ/' + this.currentstep().template;
    }

    service.getCustomer = function(){
        return service.customer;
    }

    service.setCustomer = function(c){
        service.customer = c;
    }

    service.getExCart = function(){
        return exCart;
    }

    service.exCartExists= function(){
        return exCart !== null && exCart !== undefined;
    }

    service.getRequest = function(){
        return request;
    }

    service.getGame = function(){
        return game;
    }

    service.getApp = function(){
        return appType;
    }

    service.setTeaserProd = function(t){
        service.teaserProd = t;
    }

    service.getTeaserProd = function(){
        return service.teaserProd;
    }

    service.getCart = function(){
        return cart;
    }

    service.getProdsInCart = function(){
        return  cart !== null? cart.prods : [];
    }

    service.isIn = function(){
        return admin;
    }

    service.setAdmin = function(a){
        admin = a;
    }

    service.currentstep = function(){
        return curstep;
    }

    service.prevStep = function(now){
        if (cart == null){
            return '';
        }
        var index = stepNames[now] < 0 ? 0 : stepNames[now] - 1;
        curstep = steps[index];

        return curstep;
    }

    service.nextStep = function(now){
        if (cart == null){
            return '';
        }

        var index = stepNames[now] == steps.length - 1 ? 0 : stepNames[now] + 1;
        curstep = steps[index];

        if (index == steps.length - 1){
            cart.complete = true;
            service.customer.type = "client";
            console.log("nextStep() service. Step " + curstep.name);
            console.log(service.customer);
            service.updateCustomer();
            service.endSession();
        }
        else{
            cart.complete = false;
            console.log("nextStep() service. Step " + curstep.name);
            console.log(service.customer);
            service.updateCustomer();
        }

        return curstep;
    }

    service.initGame = function(f, $http, callback){
        var url = serverUrl + '/step/list';
        $http.post(url, f).success(function(result){
            if (result.length > 0){
                game = result[0];
                callback(game);
            }
        });
    }

    service.initCartPanel = function(f, $http, callback){
        var url = serverUrl + '/step/list';
        $http.post(url, f).success(function(result){
            if (result.length > 0){
                cp = result[0];
                callback(cp);
            }
        });
    }

    service.initCrumbs = function(f, $http, callback){
        var url = serverUrl + '/step/list';
        f.app = this.getApp();
        $http.post(url, f).success(function(result){
            if (result.length > 0){
                crumb = result[0];
                callback(crumb);
            }
        });
    }

    service.initsteps = function(filter, cust, appT, f, $http, callback){
        if (cart !== null){
            service.endSession();
            service.teaserProd = null;
        }
        service.socket = io.connect('http://localhost:3000');
        service.customer = {};
        service.customer = cust;
        service.customer.type = "prospect";
        cart = {};
        cart.prods = [];
        appType = appT;
        if (appType == undefined && appObj.appID !== undefined){
            appType = appObj.appID;
        }
        console.log(appType);
        $http.post(serverUrl + '/apps/list', {tenant:appType}).success(function(applics){
            for(var a = 0; a < applics.length; a++){
                if (applics[a].active == true){
                    appType = applics[a].appID;
                    appObj = applics[a];
                    tenant = appObj.tenant;
                }
            }

            cart.start = new Date().getTime() / 1000;
            cart.complete = false;
            request = filter;
            f.app = service.getApp();
            f.visible = true;

            var url = serverUrl + '/step/list';
            $http.post(url, f).success(function(st){
                    console.log(st);
                    $.each(st, function(i, s){
                        if (admin == true && singleTempl !== ""){
                            if (singleTempl === s.name){
                                steps[0] = s;
                                stepNames[s.name] = 0;
                            }
                        }
                        else{
                            steps[i] = s;
                            stepNames[s.name] = i;
                        }
                    });
                    singleTempl = "";
                    curstep = st[0];
                    console.log(curstep);
                    console.log("service initstep(). Getting IP info");
                    var ipURL = extenstion == true?'//www.codehelper.io/api/ips/' : '//www.codehelper.io/api/ips/?js&callback=?';
                    $.getJSON(ipURL, function(response) {
                        service.customer.IP = response.IP;
                        service.customer.OS = BrowserDetect.OS;
                        service.customer.browser = BrowserDetect.browser;
                        service.customer.speed = SpeedDetect.speedMbps;
                        service.customer.city = response.CityName;
                        service.customer.state = response.RegionName;
                        service.customer.lat = response.CityLatitude;
                        service.customer.lon = response.CityLongitude;
                        service.customer.country = response.Country;

                        if (filter.zip !== undefined){
                            $http.post(serverUrl + '/zip/list', {zip:filter.zip}).success(function(geos){
                                if (geos.length > 0){
                                    var geo = geos[0];
                                    service.customer.state = geo.state;
                                    service.customer.city = geo.city;
                                    service.customer.lat = geo.lat;
                                    service.customer.lon = geo.lon;
                                }
                                service.updateCustomer(function(c){
                                    service.customer = c;
                                    service.logAction("call_start", 0, true);
                                    callback(st);
                                });
                            });
                        }
                        else{
                            service.customer.zipguess=true;
                            service.updateCustomer(function(c){
                            service.customer = c;
                            service.logAction("call_start", 0, true);
                            callback(st);
                        });
                        }
                    });


            });


        });
    };

    service.addProduct = function(p){
        cart.prods.push(p)
    }

    service.delProduct = function(p){
        $.each(cart.prods, function(i, item){
            if (item._id == p._id){
                cart.prods.splice(i, 1);
            }
        });
    }
    service.updateTotal = function(t){
        if (cart !== null){
            cart.rev = t;
        }
    }

    service.cartTotal = function(){
        var t = 0;
        if (cart !== null){
            t = cart.rev;
        }
        return t;
    }


    service.endSession = function(){

        if (cart !== null ){
            var d = new Date().getTime() / 1000 - cart.start;
            var data = {};
            data.rev = cart.complete? cart.rev : 0;
            data.numitems = cart.prods.length;
            if (cart.prods.length>0){
                data.prov = cart.prods[0].provider;
            }
            service.logAction("call_end", d, cart.complete, data);

            cart = null;
        }
    }

    service.loadproducts = function(f, $http, callback){
        var url = serverUrl + '/product/qual';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.loadsurvey = function($http, callback){
        var url = serverUrl + '/survey/list';
        $http.post(url, {app: this.getApp(), order_by:{order:1}}).success(function(result){

            callback(result);
        });

    };

    service.totalOrders = function(f, $http, callback){
        var url = serverUrl + '/log/totalOrders';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.convRate = function(f, $http, callback){
        var url = serverUrl + '/log/convRate';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.callTime = function(f, $http, callback){
        var url = serverUrl + '/log/callTime';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.totalRev = function(f, $http, callback){
        var url = serverUrl + '/log/totalRev';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.standings = function(f, $http, callback){
        var url = serverUrl + '/log/totalOrdersByApp';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.logAction = function(actionName, duration, complete, d, callback){

        var a = {};
        a.action = actionName;
        a.time = new Date();
        a.app = appType;
        a.complete = complete;
        a.duration = duration;
        a.data = d;
        a.test = admin;
        if (d !== undefined){
            a.zip = d.zip;
            a.rev = d.rev !== undefined ? Number(d.rev) : 0;
            a.prov = d.prov;
        }
        var url = serverUrl + '/log/update';
        if (admin == false){
            $http.post(url, a).success(function(a){
                if (callback !== undefined){
                    callback(a);
                }
            });
        }
    }

    service.updateCustomer = function(callback){
        console.log(service.customer);
        if (admin == true){
            if (callback !== undefined){
                callback(service.customer);
            }
            return;
        }
        service.customer.lastStep = curstep.name;
        service.customer.app = appObj.appID;
        service.customer.tenant = tenant;
        service.customer.visitTime = new Date();
        if (service.customer.zipguess=true && service.customer.zip !== undefined && service.customer.zip !== ""){
            $http.post(serverUrl + '/zip/list', {zip:service.customer.zip}).success(function(geos){
                if (geos.length > 0){
                    var geo = geos[0];
                    service.customer.state = geo.state;
                    service.customer.city = geo.city;
                    service.customer.lat = geo.lat;
                    service.customer.lon = geo.lon;
                    service.customer.zipguess= false;
                    console.log("service saving customer step " + curstep.name);
                    console.log(service.customer);
                    service.saveObj(service.customer, 'consumer', $http, function(c){
                        console.log("service customer saved");
                        console.log(service.customer);
                        if (callback !== undefined){
                            callback(c);
                        }
                    });
                }
            });
        }
        else{
            console.log("service saving customer step " + curstep.name);
            console.log(service.customer);
            service.saveObj(service.customer, 'consumer', $http, function(c){
                console.log("service customer saved");
                console.log(service.customer);
                if (callback !== undefined){
                    callback(c);
                }
            });
        }
    }

    service.saveObj = function(obj, col, $http, callback){
        $http.post(serverUrl + '/' + col + '/update', obj).success(function (data) {
            callback(data);
        });
    };
    return service;

});

