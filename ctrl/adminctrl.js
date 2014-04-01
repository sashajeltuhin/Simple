function adminctrl($scope, $rootScope, $http, $location, $compile, mkPopup, mkFilter, adminservice, cartservice){

    $scope.logo = "Admin";
    var grid = null;
    var changedlist = [];
    var changedFlds = {};
    var selected = '';
    var viewMode = "grid";
    var serverUrl = topUrl + adminURL + '/templ/';
    $scope.rootUrl = topUrl;
    $scope.filterOpen = true;
    $scope.filters = [];
    $scope.cleanFilter = {};
    $scope.viewTitle = "";
    $scope.currentApp = "";
    $scope.adminPage = serverUrl + "admin.html";
    $scope.tenantPicked = false;

    start();


    $scope.toggleFilter = function(){
        $scope.filterOpen = !$scope.filterOpen;
        if ($scope.filterOpen == true && selected !== '' && mkFilter.isInit() == false ){
            adminservice.loadMeta(selected, $http, function(m){
                refreshFilter(m);
             });
        }
    }

    $scope.export = function(){
        cleanFilter();
        adminservice.export($scope.cleanFilter, selected, $http, function(d){

    });

    }


    function refreshFilter(m, reloadFn){
        mkFilter.openFilterBar(
            {
                filterObj:selected,
                meta: m,
                parentCtrl:$('#bv_filter_bar'),
                scope: $scope,
                filter: $scope.selFilter,
                search: {label: 'Find', fn:reloadFn},
                clear:{label: 'Clear', fn:clearFilter}
            });
    }

    $scope.$on('EV_FILTER_APPLY', function(event, obj){
        $scope.selFilter = obj;
        refreshData();
    });

    $scope.$on('EV_FILTER_RESET', function(event){
        clearFilter();
    });

    function refreshData(){
        cleanFilter();
        adminservice.listObj(selected, $scope.cleanFilter, $http, function(d){
            postLoad(d);
            $scope.listData = d;
            if (viewMode == 'grid' && grid !== null){
                grid.setData(d);
                grid.render();
            }
            else if (viewMode == 'map'){
                showMap();
            }
        });

    }
    function postLoad(d){
        if (viewMode == 'fancy' && selected == 'step'){
            refreshSteps(d);
        }
        else if (viewMode == 'fancy' && selected == 'segment'){
            refreshSegments(d);
        }
    }

    $scope.newUI = function(){
        selected = '';
        var f = {};
        f.tenant = adminservice.getTenant().name;
        adminservice.setSelObj(f, $scope.loadCartSteps);
        var obj = {};
        obj.view = 'appDetail.html';
        obj.title = "New Application";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.editApp = function(a){
        selected = '';
        adminservice.setSelObj(a, $scope.loadCartSteps);
        var obj = {};
        obj.view = 'appDetail.html';
        obj.title = "Edit " + a.name;
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.updateApp = function(app){
        adminservice.saveObj(app, 'apps', $http, function(){

        });
    }

    $scope.removeApp = function(a){
        adminservice.deleteObj(a, "apps", $http, function(){
            for(var i = $scope.selTen.appObjects.length - 1; i >=0; i--){
                if (a.appID == $scope.selTen.appObjects[i].appID){
                    $scope.selTen.appObjects.splice(i, 1);
                }
            }
        });
    }


    $scope.cloneApp = function(app, steps){
        var newApp = {};
        for(var key in app){
            if (key !== '_id'){
                newApp[key] = app[key];
            }
        }
        newApp.appID = app.appID + 'copy';
        newApp.steps = steps;
        $scope.editApp(newApp);
    }
    function saveClonedApp(){
        adminservice.saveObj($scope.obj, 'apps', $http, function(a){
            for(var s = 0; s < $scope.listData.length; s++){
                var sObj = $scope.listData[s];
                if (sObj.app == $scope.origApp){
                    var newStep = {};
                    for(var k in sObj){
                        if (k !== '_id'){
                            newStep[k] = sObj[k];
                        }
                    }//$.extend(true, {}, sObj);
                    newStep.app = $scope.obj.appID;
                    adminservice.saveObj(newStep, 'step', $http, function(fld){
                });
            }
            }
        });
    }

    $scope.deleteApp = function(app){
        adminservice.deleteObj(app, 'apps', $http, function(){

        } );
    }

//    $scope.deleteStep = function(s){
//        $scope.obj = s;
//        mkPopup(
//            {
//                template: '<div>Delete ' + s.title + '?</div>',
//                title: 'Warning',
//                scope: $scope,
//                backdrop: false,
//                success: {label: 'OK', fn: delStep},
//                cancel: {label: 'No'}
//            });
//
//    }
//
//    function delStep(){
//        adminservice.deleteObj($scope.obj, 'step', $http, function(){
//            refreshData();
//        } );
//    }

    $scope.deleteStep = function(s, siblings){
        adminservice.deleteObj(s, 'step', $http, function(){
            for(var i = siblings.length - 1; i >=0; i--){
                if (s._id == siblings[i]._id){
                    siblings.splice(i, 1);
                }
            }
        } );
    }

    $scope.openWidgetDetail = function(w){
        selected = '';
        var appObj = getAppObj(w.app);
        adminservice.setAppObj(appObj);
        $scope.obj = w;
        var obj = {};
        obj.view = 'stepDetail.html';
        obj.title = "Widget Configuration";
        obj.toolbar = 'widgetTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.createStep = function(app, siblings, type){
        var obj = {};
        obj.view = 'stepDetail.html';
        obj.title = "New Flow Element";
        obj.toolbar = 'widgetTools.html';
        var def = {};
        def.app = app.appID;
        def.order = siblings.length + 1;
        def.type = type;
        def.rawhtml = "";
        obj.def = def;
        newObj(obj.title, obj.def, obj.view, obj.toolbar);
    };

    $scope.createWidget = function(app){
        var obj = {};
        obj.view = 'stepDetail.html';
        obj.title = "New Widget";
        obj.toolbar = 'widgetTools.html';
        var def = {};
        def.app = app.appID;
        def.order = siblings.length + 1;
        def.type = 'notify';
        def.rawhtml = "";
        obj.def = def;
        newObj(obj.title, obj.def, obj.view, obj.toolbar);
    }


    function cleanFilter(){
        $scope.cleanFilter = adminservice.cleanFilter($scope.selFilter);
    }

    function clearFilter(){
        $scope.filters[selected] = getDefFilter();
        $scope.selFilter = $scope.filters[selected];
        refreshData();
    }

    function buildDefFilter(extra){
        if ($scope.filters[selected] == undefined){
            $scope.filters[selected] = getDefFilter();
        }
        for(var k in extra){
            $scope.filters[selected][k] = extra[k];
        }
        $scope.selFilter = $scope.filters[selected];
        cleanFilter();
    }


    $scope.recordChanged = function(rec){
        changedlist.push(rec);
    }

    var  updateArrays = function(item){
        for(var field in item){
        var m = adminservice.getFM(selected, field);
        if (m !== undefined && m.fldtype == 'array' && Array.isArray(item[field]) == false){
            var arr = item[field].split(',');
            item[field] = arr.length > 0 && arr[0] !== ""? arr: "";
        }
        }
    }

    function getChangedList(){
        if(selected == 'step' && viewMode == 'fancy'){
            return $scope.appElements[$scope.stepApps[0].appID];
        }
        return $scope.listData;
    }

    $scope.deleteRec = function(){
        if (viewMode == 'grid'){
            var c = 0;
            $.each(changedlist, function(i, item){
                if (item.mk_rowsel == true)
                {
                    adminservice.deleteObj(item, selected, $http, function(){
                        c++;
                    });
                }
            });
            if (c > 0){
                refreshData();
            }
        }
    }

    $scope.cloneRec = function(){
        if (viewMode == 'grid'){
            var c = 0;
            $.each(changedlist, function(i, item){
                if (item.mk_rowsel == true)
                {
                    adminservice.saveClone(item, selected, $http, function(){
                        c++;
                    });
                }
            });
            if (c > 0){
                refreshData();
            }
        }
    }

    $scope.editRec = function(){
        if (viewMode == 'grid' && changedlist.length > 0){
            var item = changedlist[0];

            if (item.mk_rowsel == true)
            {
                adminservice.setSelObj(item);
                adminservice.setSelected(selected);

                var obj = {};
                obj.view = getEditView();
                obj.toolbar = 'secTools.html';
                obj.title = "Edit";
                $scope.$emit("EV_SWITCH_VIEW", obj);
                selected = '';
            }
        }
    }

    function getEditView(){
        var viewName = 'genericEdit.html';
        switch(selected){
            case 'product':
                viewName = 'productDetail.html';
                break;
            default:
                viewName = 'genericEdit.html';
                break;

        }
        return viewName;
    }

    $scope.saveObj = function(){
        $scope.saveChanges();
    }


    $scope.saveChanges = function() {
        console.log("selected when calling saveChanges:", selected);
        if (selected == ''){
            $scope.$broadcast("EV_SAVE_CHANGES");
            return;
        }

        var l = viewMode == 'grid'? changedlist: getChangedList();
        $.each(l, function(i, item){
            if (viewMode == 'fancy'){
                item.order = i + 1;
                if (selected == 'provider'){
                    var obj = {priority:item.order};
                    adminservice.saveMassObj(obj, 'product', {provider:item.name}, $http, function(ps){

                    });
                }
            }
            console.log(item);
            updateArrays(item);
            adminservice.saveObj(item, selected, $http, function(fld){
                if (i == l.length -1){
                    mkPopup(
                        {
                            template: '<div>Complete success</div>',
                            title: 'Confirmation',
                            scope: $scope,
                            backdrop: false,
                            success: {label: 'OK'}
                        });
                    changedlist = [];
                    changedFlds = {};
                }

            });
        });
    }

    $scope.saveMassChanges = function(){
        if (viewMode !== 'grid'){
            return;
        }

        var obj = {};
        for(var key in changedFlds){
            obj = changedFlds[key];
            break;
        }
        updateArrays(obj);
        cleanFilter();
            adminservice.saveMassObj(obj, selected, $scope.cleanFilter, $http, function(fld){
                    mkPopup(
                        {
                            template: '<div>Complete success</div>',
                            title: 'Confirmation',
                            scope: $scope,
                            backdrop: false,
                            success: {label: 'Got it'}
                        });
                    changedlist = [];
                    changedFlds = {};
            });
    }

    function saveObj(){
        adminservice.saveObj($scope.obj, selected, $http, function(fld){
            refreshData();
        });
    }

    $scope.saveNewObj = function(){
        adminservice.saveObj($scope.obj, selected, $http, function(fld){
            openDash();
        });
    }

    $scope.import = function(){
        adminservice.setSelected(selected);
        $scope.viewTitle = "Import " + $scope.viewTitle;
        hideGrid();
        $scope.wrapper = serverUrl + "columnMap.html";
    }

    $scope.createLead = function(){
        var obj = {};
        obj.view = 'createLead.html';
        obj.title = "Generate Lead";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.createField = function(){
        selected = 'fields';
        createObj('New Attribute');

    };

    $scope.newField = function(){
        selected = 'fields';
        newObj('New Attribute');

    };

    $scope.createProvider = function(){
        selected = 'provider';
        createObj('New Provider');

    };

    $scope.createProduct = function(){
        selected = 'product';
        newObj('New Product');
    };

//    $scope.createStep = function(){
//        selected = 'step';
//        var def = {};
//        def.type = 'cart';
//        createObj('New Flow Element', def);
//    };
//
//    $scope.createWidget = function(){
//        selected = 'step';
//        var def = {};
//        def.type = 'notify';
//        createObj('New Widget', def);
//    }

    $scope.createQuestion = function(){
        selected = 'survey';
        createObj('New Survey Question');
    }

    $scope.createApp = function(){
        selected = 'apps';
        createObj('New Application');
    }

    $scope.newApp = function(){
        selected = 'apps';
        var obj = {};
        obj.title = "New Application";
        obj.toolbar = 'widgetTools.html';
        var def = {};
        def.tenant = adminservice.getTenant();
        obj.def = def;
        newObj(obj.title, obj.def, null, obj.toolbar);
    }

    $scope.createTenant = function(){
        selected = 'tenant';
        createObj('New Tenant');
    }

    $scope.createGeo = function(){
        selected = 'zip';
        newObj('New Geo Mapping');
    }

    $scope.createBlock = function(){
        selected = 'block';
        newObj('New Template Block');
    }

    $scope.createSegRule = function(){
        selected = "rule";
        createObj('New Rule');
    }

    $scope.createUser = function(){
        selected = "user";
        createObj('New User');
    }

    $scope.createNote = function(){
        selected = "note";
        createObj('New Message');
    }

    $scope.createAction = function(){
        selected = "action";
        newObj('New Action');
    }

    $scope.createObject = function(){
        selected = "object";
        newObj('New Object');
    }

    $scope.createIcon = function(){
        selected = "icon";
        newObj('New Icon');
    }
    $scope.createStyle = function(){
        selected = "style";
        newObj('New Style');
    }

    $scope.createCat = function(){
        selected = "cats";
        newObj('New Category');
    }

    $scope.createSMTP = function(){
        selected = "smtpserver";
        newObj('SMTP Server');
    }

    $scope.createTFN = function(){
        selected = "ccnumber";
        newObj('New TFN');
    }

    function createObj(heading, def){
        adminservice.loadMeta(selected, $http, function(meta){
            $scope.obj = buildobj(meta, def);
            var templ = buildForm(meta);
            mkPopup(
                {
                    template: templ,
                    title: heading,
                    scope: $scope,
                    backdrop: false,
                    success: {label: 'Ok', fn: saveObj}
                });
        });

    }


    function newObj(heading, def, wrap, tools){
        hideGrid();
        $scope.viewTitle = heading;
        adminservice.loadMeta(selected, $http, function(meta){
            $scope.obj = buildobj(meta, def);
            if (tools !== undefined){
                $scope.subTools = serverUrl + tools;
            }
            if (wrap == undefined || wrap == null){
                $scope.wrapper = serverUrl + 'genericNew.html';
            }
            else{
                $scope.wrapper = serverUrl + wrap;
            }

            $scope.propsEl = buildForm(meta, $scope.obj);
        });
    }

    function buildobj(meta, def){
        return adminservice.buildobj(meta, def);
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
                    var sel = $('<select class="form-control" ng-model="obj.' + metafld.fldname + '"></select>').appendTo(w);
                    $.each(metafld.opts, function(i, o){
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

    $scope.loadProductFields=function(){
        var f = 'product';
        $scope.viewTitle = "Product attributes";
        loadMeta(f);
    }

    $scope.loadFields = function(){
        var f = 'fields';
        $scope.viewTitle = "Field descriptors";
        loadMeta(f);
    }

    $scope.loadProviderFields = function(){
        var f = 'provider';
        $scope.viewTitle = "Provider attributes";
        loadMeta(f);
    }

    $scope.loadStepFields = function(){
        var f = 'step';
        $scope.viewTitle = "Flow attributes";
        loadMeta(f);
    }
    $scope.loadLogFields = function(){
        var f = 'log';
        $scope.viewTitle = "Logging attributes";
        loadMeta(f);
    }

    $scope.loadSurveyFields = function(){
        var f = 'survey';
        $scope.viewTitle = "Survey attributes";
        loadMeta(f);
    }
    $scope.loadResponseFields = function(){
        var f = 'response';
        $scope.viewTitle = "Survey response attributes";
        loadMeta(f);
    }

    $scope.loadTenantFields = function(){
        var f = 'tenant';
        $scope.viewTitle = "Tenant attributes";
        loadMeta(f);
    }

    $scope.loadAppFields = function(){
        var f = 'apps';
        $scope.viewTitle = "Application attributes";
        loadMeta(f);
    }

    $scope.loadConsumerFields = function(){
        var f = 'consumer';
        $scope.viewTitle = "Consumer attributes";
        loadMeta(f);
    }

    $scope.loadZipFields = function(){
        var f = 'zip';
        $scope.viewTitle = "Geo attributes";
        loadMeta(f);
    }
    $scope.loadSegmentFields = function(){
        var f = 'segment';
        $scope.viewTitle = "Demographic segment attributes";
        loadMeta(f);
    }

    $scope.loadRuleFields = function(){
        var f = 'rule';
        $scope.viewTitle = "Segmentation rules";
        loadMeta(f);
    }

    $scope.loadBlockFields = function(){
        var f = 'block';
        $scope.viewTitle = "Template block attributes";
        loadMeta(f);
    }

    $scope.loadDraftFields = function(){
        var f = 'draft';
        $scope.viewTitle = "Template draft attributes";
        loadMeta(f);
    }

    $scope.loadUserFields = function(){
        var f = 'user';
        $scope.viewTitle = "User attributes";
        loadMeta(f);
    }

    $scope.loadSessionFields = function(){
        var f = 'session';
        $scope.viewTitle = "Session attributes";
        loadMeta(f);
    }

    $scope.loadNoteFields = function(){
        var f = 'note';
        $scope.viewTitle = "Message attributes";
        loadMeta(f);
    }

    $scope.loadActionFields = function(){
        var f = 'action';
        $scope.viewTitle = "Action attributes";
        loadMeta(f);
    }

    $scope.loadReportFields = function(){
        var f = 'report';
        $scope.viewTitle = "Report attributes";
        loadMeta(f);
    }

    $scope.loadObjectFields = function(){
        var f = 'object';
        $scope.viewTitle = "Object attributes";
        loadMeta(f);
    }
    $scope.loadIconFields = function(){
        var f = 'icon';
        $scope.viewTitle = "Icon attributes";
        loadMeta(f);
    }
    $scope.loadStyleFields = function(){
        var f = 'style';
        $scope.viewTitle = "Style attributes";
        loadMeta(f);
    }

    $scope.loadCatFields = function(){
        var f = 'cats';
        $scope.viewTitle = "Category attributes";
        loadMeta(f);
    }

    $scope.loadCCNumFields = function(){
        var f = 'ccnumber';
        $scope.viewTitle = "Call Center TFNs";
        loadMeta(f);
    }

    $scope.loadEventFields = function(){
        var f = 'event';
        $scope.viewTitle = "Events";
        loadMeta(f);
    }

    $scope.loadSmtpFields = function(){
        var f = 'smtpserver';
        $scope.viewTitle = "SMTP Server";
        loadMeta(f);
    }

    function loadMeta (f){
        selected = 'fields';
        viewMode = 'grid';
        buildDefFilter();
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, {objname:f, 'order_by':{order:1}}, $http, function(d){
                //$scope.colData = m;
                //$scope.listData = d;
                var filterData = {}
                filterData.m = m;
                filterData.f = $scope.selFilter;
                adminservice.setFilterData(filterData);
                $scope.wrapper = serverUrl + 'spread.html';
                buildNGrid(m, d);
                //refreshFilter(m, refreshData);
            });
        });
    }

    $scope.qualsByProv = function(){
        var f = {action:'qual'};
        adminservice.statsByProvider(f, $http, function(res){
            buildChart("Qualifications by carrier", "Providers", res, '', '# quals');
        });
    }

    $scope.ordersByProv = function(){
        var f = {complete:true, action:'call_end'};
        adminservice.statsByProvider(f, $http, function(res){
            buildChart("Qualifications by carrier", "Providers", res, '', '# orders');
        });
    }

    $scope.ordersReport = function(){
        selected = 'log';
        $scope.viewTitle = "Reports";
        var f = {};
        f.app = $scope.selTen.apps;
        buildDefFilter(f);
        adminservice.loadMeta(selected, $http, function(m){
        adminservice.standings(f, $http, function(res){
            buildChart("Application performance. Orders", "Orders", res, '', '# orders');
            refreshFilter(m, refreshORData);
        });
        });
    }

    function refreshORData(){
        cleanFilter();
            adminservice.standings($scope.cleanFilter, $http, function(res){
                buildChart("Application performance. Orders", "Orders", res, '', '# orders');
            });
    }

    $scope.updateGeo = function(){
        adminservice.loadMeta("zip", $http, function(m){
            adminservice.listObj("zip", {}, $http, function(d){
                $.each(d, function(i, zip){
                   adminservice.getGeoLocation(zip.zip, $http, function(loc){
                        zip.lat = loc.lat;
                       zip.lon = loc.lon;
                       adminservice.saveObj(zip, "zip", $http, function(){

                       });
                   });
                });
            });
        });

    }

    $scope.productGeo = function(){
        selected = "product";
        $scope.viewTitle = "Product availability";
        viewMode = 'map';
        buildDefFilter();
        showMap();
    }

    function showMap(){
        hideGrid();
        var f = $scope.cleanFilter;

        $scope.center = {
            lat: 37.26531,
                lng: -80.507812,
                zoom: 5
        }
        $scope.paths = {};
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, f, $http, function(d){
                $.each(d, function(i, p){
                    $scope.paths['p' + i] = {};
                    $scope.paths['p' + i].color = '#ff612f';
                    $scope.paths['p' + i].radius = 200000;
                    $scope.paths['p' + i].type ='circle';
                    $scope.paths['p' + i].message = 'Hello';
                    adminservice.listObj("zip", {zip:p.zip}, $http, function(z){
                        if (z.length > 0){
                            var code = z[0];
                            $scope.paths['p' + i].latlngs = {lat:code.lat,lng:code.lon};
                        }
                    });

                });
                refreshFilter(m, refreshData);

            });
        });
        $scope.wrapper = serverUrl + 'mapPage.html';
    }

    function buildChart(title, serName, res, sub, ytext){
        hideGrid();
        var cd = {};
        cd.sers = [];
        s = {};
        s.name = serName;
        s.data = [];
        cd.cats = [];
        cd.sers.push(s);
        cd.title = title;
        cd.subtitle = sub;
        cd.ytext = ytext;
        $.each(res, function(i, r){
            cd.cats.push(r._id);
            s.data.push(r.result);
        })
        $scope.chartData = cd;
        $scope.chartOpt = {};
        $scope.viewTitle = 'Performance';
        $scope.wrapper = serverUrl + 'chartPage.html';

    }

    function getDefFilter(more){
        var f = {};
        switch (selected){
            case "product":
                f = {};
                break;
            case "provider":
                f = {order_by:{order:1}};
                break;
            case "step":
                f = {order_by:{order:1}};
                break;
            case "segment":
                f = {order_by:{title:1, order:1}};
                break;
            case "survey":
                f = {order_by:{order:1}};
                break;
            case "apps":
                f = {order_by:{order:1}};
                break;
            case "tenant":
                f = {order_by:{order:1}};
                break;
            case "consumer":
                f = {order_by:{visitTime:-1}};
                break;
            case "log":
                f = {order_by:{time:-1}};
                break;

        }
        for(var key in more){
            f[key] = more[key];
        }
        return f;
    }

    $scope.$on("EV_SIGNED_IN", function(event,obj){
        start();
    });

    $scope.$on("EV_SIGNED_OUT", function(event){
        $scope.adminSession = null;
        $scope.wrapper = serverUrl + 'login.html';
        $scope.viewTitle = "";
    });

    $scope.execAction = function(a){
        var fn = $scope[a.fn];
        fn();
        adminservice.setLastAction(a);
    }

    function initActions(callback){
        var f = {};
        $scope.userActions = {};
        f.parentCat = 'sidenav';
        f.object = 'action';
        f.order_by = {order:1};
        adminservice.listObj('cats', f, $http, function(cats){
            $scope.navCats = cats;
            var c = 0;
            $.each($scope.navCats, function(i, ac){
                var actionFilter = {};
                var av = {};
                av.oper = 'in';
                av.val = [ac.name];
                actionFilter.cat = av;
                var ai = {};
                ai.oper = "in";
                if ($scope.adminSession.actions !== undefined && $scope.adminSession.actions.length > 0){
                    ai.val = $scope.adminSession.actions;
                    actionFilter._id = ai;
                    actionFilter.order_by = {order:1};
                    adminservice.listObj('action', actionFilter, $http, function(actions){
                        c++;
                        $scope.userActions[ac.name] = actions;
                        if (c == $scope.navCats.length - 1){
                            orderActions();
                            if (callback){
                                if ($scope.allActions.length > 0){
                                    adminservice.setLastAction($scope.allActions[0]);
                                }
                                $scope.singleDuty = $scope.allActions.length > 1 && $scope.adminSession.tenants.length > 1;
                                callback();
                            }
                        }
                    });
                }
                else{
                    if (callback){
                        callback();
                    }
                }
            });
        });
    }

    function orderActions(){
        $scope.allActions = [];
        for(var i = 0; i < $scope.navCats.length; i++){
            var ac = $scope.navCats[i];
            if ($scope.userActions[ac.name] !== undefined){
                for(var a = 0; a < $scope.userActions[ac.name].length; a++){
                    var action = $scope.userActions[ac.name][a];
                    $scope.allActions.push(action);
                }
            }
        }
    }


    function start (){
        hideGrid();
        adminservice.authenticate($http, function(uid){
            if (uid !== undefined){
                $scope.adminSession = adminservice.getAdminSession();
                initActions(function(){
                    adminservice.listObj('tenant', {"_id":$scope.adminSession.tenants, order_by:{order:1}}, $http, function(t){
                        $scope.tenants = t;
                        if (t.length > 0){
                            selectTenant(t[0]);
                        }
                        $scope.msgalert = serverUrl + 'newnotes.html';
                    });
                });
            }
            else {
                $scope.wrapper = serverUrl + 'login.html';
            }
        });
    }

    $scope.onDash = function(){

        openDash();
    }

    $scope.$on("EV_SWITCH_VIEW", function(event, obj){
        if (obj.app !== undefined){
            var appObj = getAppObj(obj.app);
            adminservice.setAppObj(appObj);
        }
        $scope.viewTitle = obj.title;
        $scope.subTools = serverUrl + obj.toolbar;
        $scope.wrapper = serverUrl + 'empty.html';
        $scope.wrapper = serverUrl + obj.view;
    });

    $scope.$on("EV_CREATE_OBJ", function(event, obj){
        newObj(obj.title, obj.def, obj.view, obj.toolbar);
    });

    $scope.openMe = function(){
        var s = adminservice.getAdminSession();
        var f = {};
        f._id = s.uid;
        adminservice.listObj('user',f,  $http, function(data){
            adminservice.setSelUser(data[0]);
            $scope.viewTitle = "User Management"
            $scope.subTools = serverUrl + 'secTools.html';
            $scope.wrapper = serverUrl + 'adminprofile.html';
        });
    }

    $scope.editTenant = function(t){
        selected = '';
        adminservice.setSelObj(t);
        $scope.viewTitle = "Tenant Configurations"
        $scope.subTools = serverUrl + 'secTools.html';
        $scope.wrapper = serverUrl + 'tenantDetail.html';
    }

    $scope.openUserManagement = function(){
        $scope.viewTitle = "User Management"
        $scope.subTools = serverUrl + 'secTools.html';
        $scope.wrapper = serverUrl + 'userList.html';
    }

    function gaugeOptions(title, metric, data){
        console.log(data);
       var opt = {
           chart: {
                type: 'gauge',
                    plotBackgroundColor: null,
                    plotBackgroundImage: null,
                    plotBorderWidth: 0,
                    plotShadow: false
            },

            title: {
                text: title
            },

            pane: {
                startAngle: -150,
                    endAngle: 150,
                    background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            },

            // the value axis
            yAxis: {
                min: 0,
                    max: 100,

                    minorTickInterval: 'auto',
                    minorTickWidth: 1,
                    minorTickLength: 10,
                    minorTickPosition: 'inside',
                    minorTickColor: '#666',

                    tickPixelInterval: 20,
                    tickWidth: 2,
                    tickPosition: 'inside',
                    tickLength: 10,
                    tickColor: '#666',
                    labels: {
                    step: 2,
                        rotation: 'auto'
                },
                title: {
                    text: metric
                },
                plotBands: [{
                    from: 0,
                    to: 10,
                    color: '#DF5353'
                }, {
                    from: 10,
                    to: 40,
                    color: '#DDDF0D'
                }, {
                    from: 40,
                    to: 100,
                    color: '#55BF3B'
                }]
            },
            series: [{
                name: title,
                data: data,
                tooltip: {
                    valueSuffix: metric
                }
            }]

        };
        return opt;
    }

    function pieOptions(title, d){
        var opt = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                type: 'pie',
                name: 'Consumer conversion',
                data: d
            }]
        };
        return opt;
    }

    function columnOpt(title, data, cats){
        var opt = {
            chart: {
                type: 'column'
            },
            colors: ['#89cc97',
                '#AA4643',
                '#89A54E',
                '#80699B',
                '#3D96AE',
                '#DB843D',
                '#92A8CD',
                '#A47D7C',
                '#B5CA92'],
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            subtitle: {
                text: ''
            },
            xAxis:{
                categories: cats
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
//                    tooltip: {
//                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//                            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
//                        footerFormat: '</table>',
//                        shared: true,
//                        useHTML: true
//                    },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: data
        }
        return opt;
    }

    $scope.openInbox = function(){
        $scope.viewTitle = "Message Center";
        $scope.subTools = serverUrl + 'inboxTools.html';
        $scope.wrapper = serverUrl + 'inbox.html';
    }

    function openDash(){
        selected = '';
        hideGrid();
        $scope.filterOpen = false;
            $scope.viewTitle = "Dashboard";
            $scope.wrapper = serverUrl + 'dash.html';
        //consumer stats
            var f = {};
            f.tenant = $scope.selTen.name;
            adminservice.peopleStats(f, $http, function(res){
               var d = [], p,c;
                $.each(res, function(i, r){

                    var del = [r._id, r.result];
                    if (p == undefined && r._id == 'prospect'){
                        p = r.result;
                    }
                    if (c == undefined && r._id == 'client'){
                        c =  r.result;
                    }
                    d.push(del);
                });
                var conv = p !== 0? c/p*100:0;
                var convAr = [];
                convAr.push(conv);
                console.log(conv);
                $scope.consOpt = pieOptions('Consumer conversion', d);
                $scope.gaugeOpt = gaugeOptions('Consumer conversion', '%', convAr);

            });
        //abandons
        var fa = {};
        fa.tenant = $scope.selTen.name;
        adminservice.abandons(fa, $http, function(res){

            var cd = {};
            cd.sers = [];
            s = {};
            s.name = '# views';
            s.data = [];
            cd.cats = [];
            cd.sers.push(s);
            cd.title = "Abandon location";
            cd.subtitle = "";
            cd.ytext = "";
            $.each(res, function(i, r){
                cd.cats.push(r._id);
                s.data.push(r.result);
            })
            $scope.abanOpt = columnOpt('Abandon', cd.sers, cd.cats);
//            $scope.abanData = cd;
//            $scope.abanOpt = {};
        });
    }

    $scope.pickTenant = function(){
        console.log($('#admin_sel_tenenat').val());
        selectTenant($scope.tenants[$('#admin_sel_tenenat').val()]);
    }

    function selectTenant(tenant){
        $scope.selTen = tenant;
        $scope.filters = [];
        adminservice.resetCache();
        adminservice.listObj('apps', {tenant:$scope.selTen.name}, $http, function(t){
            $scope.selTen.appObjects = t;
            $scope.selTen.apps = [];
            $.each(t, function(i, app){
                $scope.selTen.apps.push(app.appID);
                adminservice.setTenant($scope.selTen);
                $scope.tenantPicked = true;
                $scope.$broadcast("EV_TENANT_PICKED", $scope.selTen);

            });
            if ($scope.allActions.length > 0){
                $scope.execAction(adminservice.getLastAction());
            }
            //openDash();
        });
    }

    $scope.switchTenant = function(t){
        selectTenant(t);
    }

    $scope.loadProviders = function(){
        selected = 'provider';
        $scope.viewTitle = "Providers";
        buildDefFilter();
        loadFancyList(serverUrl + 'sortlist.html');
    }

    function getAppObj(appID){
        var appObj = null;

        for (var i = 0; i < $scope.selTen.appObjects.length;i++){
            var a = $scope.selTen.appObjects[i];
            if (appID !== undefined && a.appID === appID){
                appObj = a;
                break;
            }
            else if(appID == undefined && a.active == true){
                appObj = a;
                break;
            }
        }
        if (appObj == null){
            appObj = $scope.selTen.appObjects[0];
        }
        return appObj;
    }

    function addActiveApp(appField){
        adminservice.addActiveApp(appField);
    }

    function loadWidgets(a, type, template, title){
        if (a !== undefined && $scope.selTen.apps.indexOf(a.appID) < 0){
            $scope.selTen.apps.push(a.appID);
            $scope.selTen.appObjects.push(a);
        }

        selected = 'step';
        $scope.viewTitle = title;
        $scope.stepApps = [];
        var extra = {};
        extra.type = type;
        extra.app = {};
        if (a !== undefined){
            extra.app[a.appID] = true;
        }
        else{
            addActiveApp(extra.app);
        }
        buildDefFilter(extra);
        loadFancyList(serverUrl + template, function(d){
            //apps
            refreshSteps(d);
        });
    }

    $scope.loadAppWidgets = function(a){
        loadWidgets(a, 'app', 'appwidgets.html', 'Application Components');
    }



    $scope.loadCartSteps = function(a){
        loadWidgets(a, 'cart', 'steplisthor.html', 'User Flow');
    }

    function refreshSteps(d){
        $scope.appElements = [];
        $scope.stepApps = [];
        var apps = $scope.cleanFilter.app;
        for(var ii=0; ii< $scope.selTen.appObjects.length;ii++){
            if (apps.indexOf($scope.selTen.appObjects[ii].appID) !== -1){
                $scope.stepApps.push($scope.selTen.appObjects[ii]);
            }
        }
        $.each(apps, function(i){
            $scope.appElements[apps[i]] = [];
            $.each(d, function(x, s){
                if (s.app == apps[i]){
                    $scope.appElements[apps[i]].push(s);
                }
            });
        });

    }

    $scope.loadSegments = function(){

        selected = '';
        $scope.viewTitle = "";
        var appObj = getAppObj();
        adminservice.setAppObj(appObj);
        hideGrid();
        $scope.wrapper = serverUrl + 'seglist.html';
        $scope.subTools = serverUrl + 'ruleTools.html';
    }



    $scope.stepsByApp = function(app){
        var list = [];
        $.each($scope.listData, function(i, s){
           if (s.app == app.appID){
               list.push(s);
           }
        });
        console.log(list);

        return list;
    }

    $scope.widgetsByApp = function(app){
        var list = [];
        var f = {};
        f.app = app.appID;
        f.type = '<>cart';
        adminservice.listObj(selected, f, $http, function(d){
            list = d;
        });

        return list;
    }


    $scope.openStepInfo = function(step){
            step.isSurvey = step.name == "survey";
            var appObj = getAppObj(step.app);
            adminservice.setAppObj(appObj);
            step.isCC = appObj !== null && appObj.agent === 'agent';
            $scope.obj = step;
            mkPopup(
                {
                    templateUrl: serverUrl + 'stepDetail.html',
                    //template: templ,
                    title: 'Flow step ' + step.title,
                    scope: $scope,
                    backdrop: false,
                    bodyClass: "modalbodyLarge",
                    css: {
                        top: '100px',
                        left: '10%',
                        width: '80%',
                        margin: 'auto'
                    },
                    success: {label: 'Ok', fn: saveObj}
                });
            $scope.editStep();
    }

    $scope.editTemplate = function(){
        $scope.modalTabPage = serverUrl + 'templateTools.html';
    }

    $scope.editSurvey = function(appObj){
        var filterData = {};
        filterData.f = {exposure:appObj.agent};
        filterData.app = appObj.appID;
        adminservice.setFilterData(filterData);
        $scope.modalTabPage = serverUrl + 'surveyTools.html';
    }

    $scope.editScript = function(){
        $scope.modalTabPage = serverUrl + 'agentScript.html';
    }

    $scope.editStep = function(){
        adminservice.loadMeta('step', $http, function(meta){
            $scope.modalTabPage = serverUrl + 'stepProps.html';
            $scope.propsEl = buildForm(meta);
        });

    }



    $scope.loadSurvey = function(){
        loadSurvey('consumer', "Survey Map");
    }

    $scope.openDisposition = function(){
        loadSurvey('agent', 'Call Disposition');
    }

    function loadSurvey(exposureType, title){
        var filterData = {}
        filterData.f = {exposure:exposureType};
        adminservice.setFilterData(filterData);
        selected = '';
        var appObj = getAppObj();
        adminservice.setAppObj(appObj);
        hideGrid();
        $scope.subTools = serverUrl + 'queTools.html';
        $scope.wrapper = serverUrl + "surveyTools.html";
        $scope.viewTitle = title;
    }

    $scope.loadProvidersLst = function(){

        selected = 'provider';
        $scope.viewTitle = "Providers";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadSegmentList = function(){
        selected = 'rule';
        $scope.viewTitle = "Demographic segments";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadBlockList = function(){
        selected = 'block';
        $scope.viewTitle = "Template blocks";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadUsers = function(){
        selected = 'user';
        $scope.viewTitle = "Users";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadSessions = function(){
        selected = 'session';
        $scope.viewTitle = "Sessions";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadLogs = function(){
        selected = 'log';
        $scope.viewTitle = "Application Logs";
        var extra = {};

        extra.app = {};
        addActiveApp(extra.app);
        buildDefFilter(extra);
        loadObjNGrid();
    }

    $scope.loadProducts = function(){
        selected = 'product';
        $scope.viewTitle = "Products";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadZips = function(){
        selected = 'zip';
        $scope.viewTitle = "Geo Mapping";
        buildDefFilter();
        loadObjNGrid();
    }


    $scope.loadStepsLst = function(){
        selected = 'step';
        $scope.viewTitle = "UI Elements";
        var extra = {};
        extra.app = {};
        addActiveApp(extra.app);
        buildDefFilter(extra);
        loadObjNGrid();
    }

    $scope.loadSurveyLst = function(){
        selected = 'survey';
        $scope.viewTitle = "Surveys";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadAppLst = function(){
        selected = 'apps';
        $scope.viewTitle = "Applications";
        var extra = {};
        extra.tenant = $scope.selTen.name;
        buildDefFilter(extra);
        loadObjNGrid();
    }

    $scope.loadTenantLst = function(){
        selected = 'tenant';
        $scope.viewTitle = "Tenants";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadMessageLst = function(){
        selected = 'note';
        $scope.viewTitle = "Messages";
        buildDefFilter();
        loadObjNGrid();
    }
    $scope.loadDrafts = function(){
        selected = 'draft';
        $scope.viewTitle = "Template Drafts";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadActionLst = function(){
        selected = 'action';
        $scope.viewTitle = "Actions";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadReportLst = function(){
        selected = 'report';
        $scope.viewTitle = "Reports";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadActionLst = function(){
        selected = 'action';
        $scope.viewTitle = "Actions";
        buildDefFilter();
        loadObjNGrid();
    }
    $scope.loadObjectLst = function(){
        selected = 'object';
        $scope.viewTitle = "Objects";
        buildDefFilter();
        loadObjNGrid();
    }
    $scope.loadIconsLst = function(){
        selected = 'icon';
        $scope.viewTitle = "Icons";
        buildDefFilter();
        loadObjNGrid();
    }
    $scope.loadStyleLst = function(){
        selected = 'style';
        $scope.viewTitle = "Styles";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadCatLst = function(){
        selected = 'cats';
        $scope.viewTitle = "Categories";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadTFNLst = function(){
        selected = 'ccnumber';
        $scope.viewTitle = "TFN";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadEventLst = function(){
        selected = 'event';
        $scope.viewTitle = "Events";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadSmtpLst = function(){
        selected = 'smtpserver';
        $scope.viewTitle = "SMTP servers";
        buildDefFilter();
        loadObjNGrid();
    }

    $scope.loadConsumerLst = function(){
        selected = 'consumer';
        $scope.viewTitle = "Consumers";
        var extra = {};
        extra.app = {};
        addActiveApp(extra.app);
        buildDefFilter(extra);
        loadObjNGrid(true);
        //loadObjGrid(true);
    }

    function loadFancyList(wrap, onload){
        hideGrid();
        var f  = $scope.cleanFilter;
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, f, $http, function(d){
                viewMode = 'fancy';
                if (onload !== undefined){
                    onload(d);
                }
                $scope.colData = m;
                $scope.listData = d;
                var filterData = {}
                filterData.m = m;
                filterData.f = $scope.selFilter;
                adminservice.setFilterData(filterData);
                $scope.wrapper = wrap;
                $scope.sortableOptions = {
                    update: function(e, ui){
                        console.log(ui);
                    }
                };
                $scope.$broadcast("EV_FILTER_REBUILD", m, $scope.selFilter);
                //refreshFilter(m, refreshData);
            });
        });
    }


    function loadObjGrid(customFields){
        if (customFields == true){
            var metafilter = {};
            metafilter.custom = false;
            adminservice.loadMeta(selected, $http, function(m){
                var custfilter = {};
                custfilter.custom = true;
                custfilter.tenant = $scope.selTen.name;
                var mlist = m;
                adminservice.loadMeta(selected, $http, function(c){
                    if (c !== undefined){
                        $.each(c, function(i, cf){
                            m.push(cf);
                        });
                    }
                    loadListBindGrid(m);
                }, custfilter);
            }, metafilter);
        }
        else{
            adminservice.loadMeta(selected, $http, function(m){
                loadListBindGrid(m);
            });
        }
    }

    function loadListBindGrid(m){
        var f = $scope.cleanFilter;
        adminservice.listObj(selected, f, $http, function(d){
            viewMode = 'grid';
            $scope.colData = m;
            $scope.listData = d;
            $scope.wrapper = serverUrl + 'grid.html';
            //buildGrid(m, d);
            refreshFilter(m, refreshData);
        });
    }

    function loadObjNGrid(customFields){
        if (customFields == true){
            adminservice.loadMetaCustom(selected, $http, function(m){
                loadListBindNGGrid(m);
            });
        }
        else{
            adminservice.loadMeta(selected, $http, function(m){
                loadListBindNGGrid(m);
            });
        }
    }

    function loadListBindNGGrid(m){
        changedlist = [];
        var f = $scope.cleanFilter;
        adminservice.listObj(selected, f, $http, function(d){
            viewMode = 'grid';
            $scope.colData = m;
            $scope.listData = d;
            var filterData = {}
            filterData.m = m;
            filterData.f = $scope.selFilter;
            adminservice.setFilterData(filterData);
            $scope.wrapper = serverUrl + 'spread.html';
            buildNGrid(m, d);
        });
    }

    function buildNGrid(meta, data) {

        $scope.$broadcast("EV_FILTER_REBUILD", meta, $scope.selFilter);
        hideGrid();
        $scope.subTools = serverUrl + 'gridTools.html';
        $scope.listData = data;
        $scope.gridcolumns = [];
        var rowSelector = {};
        rowSelector.field = "mk_rowsel";
        rowSelector.displayName = " ";
        rowSelector.editableCellTemplate = '<div><input ng-model="row.entity.mk_rowsel" type="checkbox" ng-change="gridValChange(row.entity, col )"></input></div>'
        rowSelector.width = 50;
        rowSelector.enableCellEdit = true;
        $scope.gridcolumns.push(rowSelector);
        $.each(meta, function(i, fm){
            var col = {};
            col.field = fm.fldname;
            col.displayName = fm.label;
            col.enableCellEdit = true;
            col.resizable = true;
            var checkTmpl = '<div><input ng-model="row.entity.' + fm.fldname + '" type="checkbox" ng-change="gridValChange(row.entity, col )"></input></div>';
            var textTmpl = '<div><input ng-model="row.entity.' + fm.fldname + '" type="text" ng-change="gridValChange(row.entity, col )"></input></div>';
            var textareaTmpl = '<div><textarea ng-model="row.entity.' + fm.fldname + '" ng-change="gridValChange(row.entity, col )"></textarea></div>';
            var multiselectTmpl = '<input mk-select listfn="listUsers(q)" loadfn="selectSender(id)" multiple="1" style="width:260px" type="hidden" placeholder="' + fm.label + '...">'
            switch (fm.fldtype){
                case "text":
                    col.width =  100;
                    col.editableCellTemplate = textTmpl;
                    break;
                case "longtext":
                case "array":
                    col.editableCellTemplate = textareaTmpl;
                    col.width =  200;
                    break;
                case "bool":
                    col.cellTemplate = checkTmpl;
                    col.editableCellTemplate = checkTmpl;
                    col.width =  50;
                    break;
                default:
                    col.width =  100;
                    break;
            }
            if (fm.opts !== undefined){

                    var options = '';
                    if (fm.defval !== undefined && fm.defval !== ""){
                        options += '<option value="' + fm.deflabel + '"></option>';
                    }
                    $.each(fm.opts, function(i, o){
                        var optval = fm.optfld !== undefined ? o[fm.optfld] : o;
                        var optlabel = fm.optlabel !== undefined && fm.optlabel !== "" ? o[fm.optlabel] : optval;
                        options += '<option value="' + optval + '">'+ optlabel +'</option>';
                    });

                col.editableCellTemplate = '<div><select ng-model="row.entity.' + fm.fldname + '">' + options + '</select></div>';
            }
            $scope.gridcolumns.push(col);
        });

//        $scope.$on('ngGridEventScroll', function(event, obj){
////            console.log('scrolling');
//        });

        $scope.gridOptions = {
            data: 'listData',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: true,
            enableColumnResize: true,
            virtualizationThreshold: 40,
            columnDefs: 'gridcolumns'
        };

        $scope.gridValChange = function(entity, col){
            console.log("cell changed", entity);
            var changed = col.field;
            var id = entity._id;
            var obj = changedFlds[id];
            if (obj == undefined){
                obj = {};
                changedFlds[id] = obj;
            }
            obj[changed] = entity[changed];
            changedlist.push(entity);
        }

    }


    function buildGrid(meta, data) {
        if (grid !== null){
            grid.destroy();
        }
        var gridOptions = {
            editable: true,
            enableAddRow: true,
            enableCellNavigation: true,
            asyncEditorLoading: false,
            autoEdit: true
        }
        $('#adminGrid').show();
        var columns = [];
        var rowSelector = {};
        rowSelector.id = "mk_rowsel";
        rowSelector.name = "";
        rowSelector.field = "mk_rowsel";
        rowSelector.width = 20;
        rowSelector.editor = Slick.Editors.Checkbox;
        rowSelector.formatter = Slick.Formatters.Checkmark;
        columns.push(rowSelector);
        $.each(meta, function(i, fm){
            var col = {};
            col.id = fm.fldname;
            col.name = fm.label;
            col.field = fm.fldname;

            switch (fm.fldtype){
                case "text":
                    col.editor = Slick.Editors.Text;
                    col.width =  100;
                    break;
                case "longtext":
                case "array":
                    col.editor = Slick.Editors.LongText;
                    col.width =  200;
                    break;
                case "bool":
                    col.editor = Slick.Editors.Checkbox;
                    col.formatter = Slick.Formatters.Checkmark;
                    col.width =  50;
                    break;
                default:
                    col.editor = Slick.Editors.Text;
                    col.width =  100;
                    break;
            }
            columns.push(col);
        });


        grid = new Slick.Grid($('#adminGrid'), data, columns, gridOptions);

        grid.setSelectionModel(new Slick.CellSelectionModel());

        grid.onCellChange.subscribe(function(e,args){
            console.log("cell changed", args);
            var changed = grid.getColumns()[args.cell].field;
            var id = args.item._id;
            var obj = changedFlds[id];
            if (obj == undefined){
                obj = {};
                changedFlds[id] = obj;
            }
            obj[changed] = args.item[changed];
            changedlist.push(args.item);
        });
    }

    function hideGrid (){
        $('#adminGrid').hide();
        if (grid !== null){
            grid.destroy();
            grid = null;
        }
    }

    $scope.viewFlow = function(app){
        $scope.viewTitle = "Preview";
        $scope.masterTmpl = $scope.rootUrl +'/' + app.template + '?preview=1&tenant=' + $scope.selTen.name + '&app=' + app._id;
        $scope.wrapper = serverUrl + 'flow.html';

    }
    $scope.openCallCenter = function(){
        $scope.viewTitle = "Call Center";

        hideGrid();
        var session = adminservice.getAdminSession();
        console.log(session);
        $scope.masterTmpl = $scope.rootUrl +'/'+ "cctmpl.html?tenant=" + $scope.selTen.name + '&session=' + session._id;

        $scope.filterOpen = false;
        $scope.wrapper = serverUrl + 'flow.html';
    }

    $scope.keySaveObj = function(event){
        if (event.metaKey || event.ctrlKey){
            if (event.which == 83){ //i
                event.preventDefault();
                console.log('keydown ctrl s', event);
                $scope.saveChanges();
            }
        }
    }

}
