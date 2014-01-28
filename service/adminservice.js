angular.module('cart').factory('adminservice', function($q, $cookies) {

    var service = {};
    var serverUrl = topUrl + '/app';
    var cache = [];
    var fieldCache = {};
    var selTen = {};
    var selAppObj = {};
    var selObj = {};

    var signedId = {};

    service.getAdminSession = function(){
        return signedId;
    }
    function setsignedId (data){
        signedId = data;
        if (data == null || data == undefined){
            delete $cookies.mk_uid;
        }
        else{
            $cookies.mk_uid = data._id;
        }
    }

    service.setTenant = function(t){
        selTen = t;
    }

    service.getTenant = function(){
        return selTen;
    }

    service.setAppObj = function(a){
        selAppObj = a;
    }

    service.getAppObj = function(){
        return selAppObj;
    }

    service.setSelected = function(obj){
        selObj = obj;
    }

    service.getSelected = function(){
        return selObj;
    }

    service.resetCache = function(){
        cache = [];
        fieldCache = {};
    }

    service.authenticate = function($http, callback){
        if (signedId._id !== undefined){
            callback(signedId._id);
        }
        else{
            var sid = $cookies.mk_uid;
            if (sid !== undefined){
                var f = {_id : sid};
                $http.post(serverUrl + '/auth/there', f).success(function (data) {
                        setsignedId(data);
                        callback(signedId._id);
                }).error(function(data, status) {
                        callback(signedId._id);
                    });
            }
            else{
                callback(signedId._id);
            }
        }
    }

    service.signIn = function(u, p, $http, callback){
        var user = {};
        user.username = u;
        user.password = p;
        $http.post(serverUrl + '/auth/login', user).success(function (data) {
            setsignedId(data);
            callback(null, data);
        }).error(function(data, status) {
                callback(data, null);
        });
    }

    service.signOut = function($http, callback){
        $http.post(serverUrl + '/auth/logout').success(function () {
            setsignedId(null);
            callback(null);
        }).error(function(data, status) {
            callback(data);
        });
    }

    service.resetCacheObj = function(obj){
        if (cache[obj] !== undefined){
        cache[obj] = null;
        }
    }

    service.loadMeta = function(obj, $http, callback, filter){
        if (filter !== undefined || cache[obj] == undefined || cache[obj] == null){
            var f = {objname : obj, 'order_by':{order:1}};
            if (filter !== undefined){
                for(var el in filter){
                    f[el] = filter[el];
                }
            }
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
        delete fld.mk_rowsel;
        $http.post(serverUrl + '/' + obj + '/update', fld).success(function (data) {
            callback(data);
            if (obj == 'fields'){
                service.resetCacheObj(fld.objname);
            }
        });
    };

    service.import = function(fileName, colMap, objname, $http, callback){
        var filter = {fn: fileName, map : colMap};
        $http.post(serverUrl + '/' + objname + '/import', filter).success(function (data) {
            if (data.success == true){
                callback(data.recs);
            }else{
                console.log(data.err);
            }
        });
    };

    service.getColumnMap = function(fileName, objname, $http, callback){
        var filter = {fn: fileName};
        $http.post(serverUrl +  '/' + objname + '/columnMap', filter).success(function (data) {
            if (data.success == true){
                callback(data.map);
            }else{
                console.log(data.err);
            }
        });
    }

    service.deleteObj = function(fld, obj, $http, callback){
        $http.post(serverUrl + '/' + obj + '/delete', fld).success(function (data) {
            callback(data);
            if (obj == 'fields'){
                service.resetCacheObj(fld.objname);
            }
        });
    };

    service.saveMassObj = function(fld, obj, filter, $http, callback){
        delete fld.mk_rowsel;
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

    service.total = function(obj, f, $http, callback){
        var url = serverUrl + '/report/total';
        var filter = {};
        filter.obj = obj;
        filter.filter = f;
        $http.post(url, filter).success(function(result){
            callback(result);
        });
    }

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

    service.buildobj = function(meta, def){
        var that = this;
        var obj = {};
        $.each(meta, function(i, key){
            obj[key.fldname] = def!==undefined && def[key.fldname] !== undefined ? def[key.fldname] : key.defval;
        });
        return obj;
    }

    service.buildForm = function(meta, optionscallback, obj){
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

                var opts = null;
                if (optionscallback !== undefined){
                    opts = optionscallback(metafld, obj);
                }
                if (opts == null){
                    opts = metafld.opts;
                }

                if(opts !== undefined && opts.length > 0){
                    var sel = $('<select ng-model="obj.' + metafld.fldname + '"></select>').appendTo(w);
                    $.each(opts, function(i, o){
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

    service.addActiveApp = function(appField){
        var c = 0;

        $.each(selTen.appObjects, function(i, a){
            if (a.active === true){
                appField[a.appID] = true;
                c++;
            }
        });
        if (c == 0){
            appField[selTen.appObjects[0].appID] = true;
        }
    }

    service.createObj = function(heading, def, objname, mkPopup, scope, $http, callback, optionsCallback){
        service.loadMeta(objname, $http, function(meta){
            scope.obj = service.buildobj(meta, def);
            var templ = service.buildForm(meta, optionsCallback, def);
            mkPopup(
                {
                    template: templ,
                    title: heading,
                    scope: scope,
                    backdrop: false,
                    success: {label: 'Ok', fn: callback}
                });
        });

    };

    service.editObj = function(heading, obj, objname, mkPopup, scope, $http, callback, optionsCallback){
        service.loadMeta(objname, $http, function(meta){
            scope.obj = obj;
            var templ = service.buildForm(meta, optionsCallback, obj);
            mkPopup(
                {
                    template: templ,
                    title: heading,
                    scope: scope,
                    backdrop: false,
                    success: {label: 'Ok', fn: callback}
                });
        });

    };


    return service;

});
