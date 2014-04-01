angular.module('cart').factory('adminservice', function($q, $cookies) {

    var service = {};
    var serverUrl = topUrl + '/app';
    var resourceUrl = topUrl + adminURL + '/templ/';
    var templUrl = resourceUrl + 'ctrls/';
    var cache = [];
    var fieldCache = {};
    var selTen = {};
    var selAppObj = {};
    var selObjName = '';

    var selObj = {};

    var signedId = {};
    var selUser = {};
    var selFilter = {};
    var selCallBack = null;
    var ruleParams = null;
    var filterdata = {};
    var views = [];
    var currentView = {};
    var widgets = {};
    var lastAction = null;

    service.setSelUser = function(u){
        selUser = u;
    }

    service.getSelUser = function(){
        return selUser;
    }

    service.setRuleParams = function(p){
        ruleParams = p;
    }

    service.getRuleParams = function(){
        return ruleParams;
    }

    service.setFilter = function(f){
        selFilter = f;
    }

    service.getFilter = function(){
        return selFilter;
    }

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
        selObjName = obj;
    }

    service.getSelected = function(){
        return selObjName;
    }

    service.setSelObj = function(obj, callback){
        selObj = obj;
        selCallBack = callback;
    }
    service.getSelCallback = function(){
        return selCallBack;
    }

    service.getSelObj= function(){
        return selObj;
    }

    service.resetCache = function(){
        cache = [];
        fieldCache = {};
    }

    service.cacheWidget = function(w){
        if (w.controller !== undefined){
            widgets[w.controller] = w;
        }
    }

    service.giveMeWidget = function(controller){
        var w = null;
        if (controller in widgets){
            w = widgets[controller];
        }
        return w;
    }

    service.authenticate = function($http, callback){
        if (signedId._id !== undefined){
            service.initViews($http, function(){
                callback(signedId._id);
            });

        }
        else{
            var sid = $cookies.mk_uid;
            if (sid !== undefined){
                var f = {_id : sid};
                $http.post(serverUrl + '/auth/there', f).success(function (data) {
                        setsignedId(data);
                        service.initViews($http, function(){
                        callback(signedId._id);
                    });
                }).error(function(data, status) {
                        callback(signedId._id);
                    });
            }
            else{
                service.initViews($http, function(){
                    callback(signedId._id);
                });
            }
        }
    }

    service.initViews = function($http, callback){
        var url = serverUrl + '/step/list';
        var f = {app:'admin'};
        $http.post(url, f).success(function(st){
            views = st;
            currentView = views[0];
            if (callback !== undefined){
                callback();
            }
        });
    }

    service.getCurrentView = function(){
        return currentView;
    }

    service.setLastAction = function(a){
        lastAction = a;
    }

    service.getLastAction = function(){
        return lastAction;
    }

    service.signIn = function(u, p, $http, callback){
        var user = {};
        user.username = u;
        user.password = p;
        $http.post(serverUrl + '/auth/login', user).success(function (data) {
            setsignedId(data);
            callback(null, data);
        }).error(function(data, status) {
                callback(data.err, null);
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
        if(metafld.optobj == 'apps' && selTen !== undefined && selTen.apps !== undefined && selTen.apps.length > 0){
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

    service.loadMetaCustom = function(objname, $http, callback, filter){
        var metafilter = {};
        var fv = {};
        fv.oper = '<>';
        fv.val = true;
        metafilter.custom = fv;
        if (filter !== undefined){
            for(var el in filter){
                metafilter[el] = filter[el];
            }
        }
        service.loadMeta(objname, $http, function(m){
            var custfilter = {};
            custfilter.custom = true;
            custfilter.tenant = selTen.name;
            if (filter !== undefined){
                for(var el in filter){
                    custfilter[el] = filter[el];
                }
            }
            service.loadMeta(objname, $http, function(c){
                if (c !== undefined){
                    $.each(c, function(i, cf){
                        m.push(cf);
                    });
                }
                callback(m);
            }, custfilter);
        }, metafilter);
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

    service.publishTemplate = function(draft, widget, obj, $http, callback){
        var f = {};
        f.draft = draft;
        f.widget = widget;
        f.tenant = service.getTenant().name;
        $http.post(serverUrl + '/' + obj + '/publish', f).success(function (data) {
            callback(data);

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

    service.export = function(filter, objname, $http, callback){
        var obj = {};
        obj.f = filter;
        obj.cols = [];
        for (var c = 0; c < filterdata.m.length; c++){
            var fld = filterdata.m[c];
            obj.cols.push(fld.fldname);
        }
        $http.post(serverUrl + '/' + objname + '/export', obj).success(function (data) {
            if (data.success == true){
                callback(data.recs);
            }else{
                console.log(data.err);
            }
        });

    }

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

    service.compute = function(obj, f, groups, $http, callback){
        var url = serverUrl + '/report/calc';
        var request = {};
        request.obj = obj;
        request.filter = f;
        request.groupBy = groups;
        $http.post(url, request).success(function(result){
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

    service.bindObjData = function(obj, fields){
        for (var i = 0; i < fields.length; i++){
            var fd = fields[i];
            if (fd.options !== undefined && fd.options.length > 0 && fd.fldtype == 'array'){
                obj[fd.fldname] = [];
                for(var o=0; o < fd.options.length; o++){
                    var opt = fd.options[o];
                    if (opt.optvalue == true){
                        obj[fd.fldname].push(opt.fldvalue);
                    }
                }
            }
            else{
                obj[fd.fldname] = fd.fldvalue;
            }
        }
    }

    service.bindObj = function(meta, obj, fieldCallback){
        var fieldList = [];
        for(var key in meta){
            var metafld = meta[key];
            metafld = fieldCallback(metafld);
            if (metafld !== null && metafld.editable == true){
                var fd = {};
                if (metafld.template !== undefined){
                    fd.template = metafld.template;
                    delete metafld.template;
                }
                fieldList.push(fd);
                service.buildField(fd, metafld, obj);
            }

        }
        return fieldList;
    }

    service.buildField = function(fd, metafld, obj){
        fd.label = metafld.label;
        fd.fldname = metafld.fldname;
        fd.fldtype = metafld.fldtype;

        if (metafld.opts !== undefined){
            fd.options = [];
            if (fd.template == undefined){
                if (fd.fldtype == 'array'){
                    fd.template = templUrl + 'checklist.html';
                }else{
                    fd.template = templUrl + 'dropdown.html';
                }
            }
            if (metafld.defval !== undefined && metafld.defval !== ""){
                fd.options.push({optvalue:metafld.defval,label: metafld.deflabel});
            }
            $.each(metafld.opts, function(i, item){
                var opt = {};
                fd.options.push(opt);

                var optval = metafld.optfld !== undefined && metafld.optfld !== "" ? item[metafld.optfld]: item;
                var optdesc = metafld.optlabel !== undefined && metafld.optlabel !== "" ? item[metafld.optlabel]: optval;
                if (fd.fldtype == 'array'){
                    opt.optvalue = obj[metafld.fldname] !== undefined && obj[metafld.fldname].indexOf(optval) >= 0;
                    opt.fldvalue = optval;
                }else{
                    opt.optvalue = optval;
                }
                opt.label = optdesc;
            });
            fd.fldvalue = obj[metafld.fldname];
        }
        else {
            if (fd.template == undefined){
                switch (metafld.fldtype){
                    case 'text':
                        fd.template = templUrl + 'text.html';
                        break;
                    case 'bool':
                        fd.template = templUrl + 'checkbox.html';
                        break;
                    case 'longtext':
                        fd.template = templUrl + 'textarea.html';
                        break;
                    case 'image':
                        fd.template = templUrl + 'graphics.html';
                        break;
                    default:
                        fd.template = templUrl + 'text.html';
                        break;

                }
            }
            if (obj[metafld.fldname] == undefined){
                obj[metafld.fldname] = "";
            }
            fd.fldvalue = obj[metafld.fldname];
        }
    }

    service.buildForm = function(meta, optionscallback, obj){
        var top = $('<div></div>');
        for(var key in meta){
            var metafld = meta[key];
            if (metafld.editable == true){
                var block = $('<div class="form-group"><label class="control-label">' + metafld.label + '</label></div>').appendTo(top);
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
                if (optionscallback !== undefined && optionscallback !== null){
                    opts = optionscallback(metafld, obj);
                }
                if (opts == null){
                    opts = metafld.opts;
                }

                if(opts !== undefined && opts.length > 0){
                    var sel = $('<select class="form-control" ng-model="obj.' + metafld.fldname + '"></select>').appendTo(w);
                    $.each(opts, function(i, o){
                        var optval = metafld.optfld !== undefined ? o[metafld.optfld] : o;
                        sel.append('<option value="' + optval + '">'+ optval +'</option>');
                    });
                }
                else{
                    var ed = inputtype == 'textarea' ? '<textarea class="form-control" ng-model="obj.' + metafld.fldname + '" ></textarea>': '<input class="form-control" type="' + inputtype + '" ng-model="obj.' + metafld.fldname + '" class="' + cls + '" ' + atts + '>';
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

    service.getActiveApp = function(){
        $.each(selTen.appObjects, function(i, a){
            if (a.active === true){
                return a;
            }
        });
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

    service.setFilterData = function(filterData){
        filterdata = filterData;
    }

    service.getFilterData = function(){
        return filterdata;
    }

    service.cleanFilter = function(selFilter, skipArray){
        var cleanFilter = {};
        for(var key in selFilter){
            if (key !== 'order_by' && angular.isObject(selFilter[key])){
                var vals = [];
                for (var k in selFilter[key]){
                    if (selFilter[key][k] == true){
                        vals.push(k);
                    }
                }
                if (vals.length > 0){
                    cleanFilter[key] = vals;
                }
            }
            else{
                if (selFilter[key] !== undefined && selFilter[key] != "")
                    cleanFilter[key] = selFilter[key];
            }
        }
        return cleanFilter;
    }

    service.cloneObj = function(obj){
        var clone = {};
        for(var key in obj){
            if (key !== '_id'){
                clone[key] = obj[key];
            }
        }
        return clone;
    }

    service.saveClone = function(obj, objname, $http, callback){
        var clone = service.cloneObj(obj);
        service.saveObj(clone, objname, $http, callback);
    }

    service.objToString = function(obj, objname, $http, callback){
        var desc = '';
        var f = {};
        f.descField = true;
        f.order_by = {descfieldorder:1};
        service.loadMeta(objname, $http, function(meta){
            var parts = [];
            for(var i = 0; i < meta.length; i++){
                var fld = meta[i];
                if (obj[fld.fldname] !== undefined && obj[fld.fldname] !== ''){
                    parts.push(obj[fld.fldname]);
                }
            }
            desc = parts.join(' ');
            if (callback !== undefined){
               callback(desc);
            }
        }, f);
    }


    return service;

});
