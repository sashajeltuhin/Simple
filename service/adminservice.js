angular.module('cart').factory('adminservice', function($q) {

    var service = {};
    var serverUrl = 'http://localhost';
    var cache = [];
    var fieldCache = {};
    var selTen = {};

    service.setTenant = function(t){
        selTen = t;
    }

    service.loadMeta = function(obj, $http, callback){
        if (cache[obj] == undefined){
            var f = {objname : obj, 'order_by':{order:1}};
            $http.post(serverUrl + '/fields/list', f).success(function (data)
            {
                var opts = [];
                $.each(data, function(i, md){
                    if (md.fldopts !== undefined && md.fldopts.length > 0){
                        md.opts = md.fldopts;
                    }
                    if(md.options == true)
                    {
                        opts.push(md);
                    }
                    fieldCache[obj + '.' + md.fldname] = md;
                });
                if (opts.length > 0){
                var i = 0;
                loadOptions(data, opts, i, callback, obj, $http);
                }
                else{
                    cache[obj] = data;
                    callback(data);
                }
            });
        }
        else{
            callback(cache[obj]);
        }
    }

    service.getFM = function(obj, field){
        return fieldCache[obj + '.' + field];
    }

    function loadOptions(meta, opts, i, callback, obj, $http){

        var metafld = opts[i];
        var f = {};
        if (metafld.optfilter !== undefined){
            f = metafld.optfilter;
        }
        console.log(selTen);
        if(metafld.optobj == 'apps' && selTen !== undefined && selTen.apps.length > 0){
            f.appID = selTen.apps;
        }
        var prom = service.listObjProm(metafld.optobj, f,  $q, $http);
        prom.then(function(p){
            metafld.opts = p;
            i++;
            if (i < opts.length){
                loadOptions(meta, opts, i, callback, obj, $http);
            }
            else{
                cache[obj] = meta;
                callback(meta);
            }
        });
    }

    service.saveObj = function(fld, obj, $http, callback){
        $http.post(serverUrl + '/' + obj + '/update', fld).success(function (data) {
            callback(data);
        });
    };

    service.deleteObj = function(fld, obj, $http, callback){
        $http.post(serverUrl + '/' + obj + '/delete', fld).success(function (data) {
            callback(data);
        });
    };

    service.saveMassObj = function(fld, obj, filter, $http, callback){
        var f = {};
        f.obj = fld;
        f.filter = filter;
        $http.post(serverUrl + '/' + obj + '/update', f).success(function (data) {
            callback(data);
        });
    };

    service.saveField = function(fld, $http, callback){
        $http.post(serverUrl + '/fields/update', fld).success(function (data) {
            callback(data);
        });
    };

    service.listObj = function(obj, filter, $http, callback){
        var f = filter;
        $http.post(serverUrl + '/' + obj + '/list', f).success(function(data){
            callback(data);
        });
    };

    service.listObjProm = function(obj, filter, $q, $http){
        var d = $q.defer();
        var f = filter;
        console.log("list obj meta options with filter");
        console.log(f);
        $http.post(serverUrl + '/' + obj + '/list', f).success(function(data){
            d.resolve(data);
        });
        return d.promise;
    }
    service.listFldObj = function(obj, fld, val, $http, callback){
        var f = {};
        f[fld] = val;
        f.distinct = fld;
        $http.post(serverUrl + '/' + obj + '/list', f).success(function(data){
            callback(data);
        });
    };

    service.peopleStats = function(f, $http, callback){
        var url = serverUrl + '/consumer/bytype';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.abandons = function(f, $http, callback){
        var url = serverUrl + '/consumer/abandons';
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

    service.statsByProvider = function(f, $http, callback){
        var url = serverUrl + '/log/statsByProvider';
        $http.post(url, f).success(function(result){

            callback(result);
        });

    };

    service.getGeoLocation = function(zip, $http, callback){
        $http.get('http://nominatim.openstreetmap.org/search?country=us&postalcode=' + zip + '&format=json').success(function(geo){
            var loc = {};
            if(geo.length > 0){
                loc.lat = geo[0].lat;
                loc.lon = geo[0].lon;
            }
            callback(loc);
        });
    }

    return service;

});
