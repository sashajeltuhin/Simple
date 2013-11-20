function adminctrl($scope, $rootScope, $http, $location, mkPopup, mkFilter, adminservice, cartservice){

    $scope.logo = "Admin";
    var grid = null;
    var changedlist = [];
    var changedFlds = {};
    var selected = '';
    var viewMode = "grid";
    var serverUrl = 'http://localhost/templ/';
    var rootUrl = 'http://localhost/';
    $scope.filterOpen = true;
    $scope.filters = [];
    $scope.cleanFilter = {};
    $scope.viewTitle = "";
    $scope.currentApp = "";


    start();

    $scope.editScript = function(p){
        if (p.editscript == undefined){
            p.editscript = true;
        }
        else{
            p.editscript = !p.editscript;
        }
    }

    $scope.showView = function(p){
        if (p.openView == undefined || p.openView == false){
            var appObj;
            $.each($scope.selTen.appObjects, function(i, a){
                if (a.appID === p.app){
                    appObj = a;
                }
            });
            cartservice.setAppObj(appObj);
            cartservice.setSingleTempl(p.name);
            $scope.masterTmpl = appObj.template;
        }
        if (p.openView == undefined){
            p.openView = true;
        }
        else{
            p.openView = !p.openView;
        }
    }

    $scope.toggleFilter = function(){
        $scope.filterOpen = !$scope.filterOpen;
        if ($scope.filterOpen == true && selected !== '' && mkFilter.isInit() == false ){
            adminservice.loadMeta(selected, $http, function(m){
                refreshFilter(m);
             });
        }
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

    $scope.cloneExp = function(exp){
        var newExp = {};
        selected = "segment";
        for(var key in exp){
            if (key !== '_id'){
                newExp[key] = exp[key];
            }
        }
        adminservice.loadMeta(selected, $http, function(meta){
            $scope.obj = newExp;
            var templ = buildForm(meta);
            mkPopup(
                {
                    template: templ,
                    title: "Clone expression",
                    scope: $scope,
                    backdrop: false,
                    success: {label: 'Ok', fn: saveObj}
                });
        });
    }

    $scope.cloneApp = function(app){
        var newApp = {};
        for(var key in app){
            if (key !== '_id'){
                newApp[key] = app[key];
            }
        }
        newApp.appID = app.appID + 'copy';
        $scope.origApp = app.appID;
        adminservice.loadMeta('apps', $http, function(meta){
            $scope.obj = newApp;
            var templ = buildForm(meta);
            mkPopup(
                {
                    template: templ,
                    title: "Clone application",
                    scope: $scope,
                    backdrop: false,
                    success: {label: 'Ok', fn: saveClonedApp}
                });
        });
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

    $scope.deleteStep = function(s){
        adminservice.deleteObj(s, 'step', $http, function(){
               refreshData();
        } );
    }

    $scope.deleteSegment = function(s){
        adminservice.deleteObj(s, 'segment', $http, function(){
            refreshData();
        } );
    }

    function cleanFilter(){
        $scope.cleanFilter = {};
        for(var key in $scope.selFilter){
            if (key !== 'order_by' && angular.isObject($scope.selFilter[key])){
                var vals = [];
                for (var k in $scope.selFilter[key]){
                    if ($scope.selFilter[key][k] == true){
                        vals.push(k);
                    }
                }
                if (vals.length > 0){
                    $scope.cleanFilter[key] = vals;
                }
            }
            else{
            if ($scope.selFilter[key] !== undefined && $scope.selFilter[key] != "")
                $scope.cleanFilter[key] = $scope.selFilter[key];
            }
        }
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

    $scope.saveChanges = function() {
        console.log(changedFlds);

        var l = viewMode == 'grid'? changedlist: $scope.listData;
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

    $scope.createField = function(){
        selected = 'fields';
        createObj('New Attribute');

    };

    $scope.createProvider = function(){
        selected = 'provider';
        createObj('New Provider');

    };

    $scope.createProduct = function(){
        selected = 'product';
        createObj('New Product');

    };

    $scope.createStep = function(){
        selected = 'step';
        createObj('New Flow Element');

    };

    $scope.createQuestion = function(){
        selected = 'survey';
        createObj('New Survey Question');
    }

    $scope.createApp = function(){
        selected = 'apps';
        createObj('New Application');
    }
    $scope.createTenant = function(){
        selected = 'tenant';
        createObj('New Tenant');
    }

    $scope.createGeo = function(){
        selected = 'zip';
        createObj('New Geo Mapping');
    }

    $scope.createSegment = function(){
        selected = 'segment';
        createObj('New Demographic Segment');
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

    };

    $scope.editStep = function(s){
        selected = 'step';
        editObj(s.title, s);
    }

    $scope.editSegment = function(s){
        selected = 'segment';
        editObj(s.exp, s);
    }

    function editObj(heading, obj){
        adminservice.loadMeta(selected, $http, function(meta){
            $scope.obj = obj;
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

    };
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

    function loadMeta (f){
        selected = 'fields';
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, {objname:f, 'order_by':{order:1}}, $http, function(d){
                $scope.colData = m;
                $scope.listData = d;
                $scope.wrapper = serverUrl + 'grid.html';
                buildGrid(m, d);
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


    function start (){
        hideGrid();
        adminservice.listObj('tenant', {}, $http, function(t){
            $scope.tenants = t;

        });
    }

    $scope.onDash = function(){
        openDash();
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

    function openDash(){
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
        $scope.selTen = $scope.tenants[$('#admin_sel_tenenat').val()];
        adminservice.listObj('apps', {tenant:$scope.selTen.name}, $http, function(t){
            $scope.selTen.appObjects = t;
            $scope.selTen.apps = [];
            $.each(t, function(i, app){
                $scope.selTen.apps.push(app.appID);
                adminservice.setTenant($scope.selTen);

            })
            openDash();

        });
    }

    $scope.loadProviders = function(){
        selected = 'provider';
        $scope.viewTitle = "Providers";
        buildDefFilter();
        loadFancyList(serverUrl + 'sortlist.html');
    }

    $scope.loadCartSteps = function(){
        selected = 'step';
        $scope.viewTitle = "User Flow";
        var extra = {};
        extra.type = 'cart';
        extra.app = {};
        var c = 0;
        $.each($scope.selTen.appObjects, function(i, a){
            if (a.active === true){
                extra.app[a.appID] = true;
                c++;
            }
        });
        if (c == 0){
            extra.app[$scope.selTen.appObjects[0].appID] = true;
        }

        buildDefFilter(extra);
        loadFancyList(serverUrl + 'steplist.html', function(d){
            //apps
            refreshSteps(d);
        });
    }

    function refreshSteps(d){
        var cap = "";
        $scope.stepApps = [];
        $.each(d, function(i, s){
            if (cap !== s.app){
                cap = s.app;
                for(var ii=0; ii< $scope.selTen.appObjects.length;ii++){
                    if ($scope.selTen.appObjects[ii].appID == s.app){
                        $scope.stepApps.push($scope.selTen.appObjects[ii]);
                    }
                }
            }
        })
    }

    $scope.loadSegments = function(){
        selected = 'segment';
        $scope.viewTitle = "Segmentation and rules";
        var extra = {};
        extra.app = {};
        var c = 0;
        $.each($scope.selTen.appObjects, function(i, a){
            if (a.active === true){
                extra.app[a.appID] = true;
                c++;
            }
        });
        if (c == 0){
            extra.app[$scope.selTen.appObjects[0].appID] = true;
        }

        buildDefFilter(extra);
        loadFancyList(serverUrl + 'seglist.html', function(d){
            refreshSegments(d);

        });
    }

    function refreshSegments(d){
        var seg = "";
        $scope.segs = [];
        $.each(d, function(i, e){
            if (seg !== e.title){
                seg = e.title;
                $scope.segs.push(e);
            }
        })
    }

    $scope.expBySeg = function(s){
        var list = [];
        $.each($scope.listData, function(i, e){
            if (e.title == s.title){
                list.push(e);
            }
        });

        return list;
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

    $scope.loadSurvey = function(){
        selected = 'survey';
        $scope.viewTitle = "Surveys";
        buildDefFilter();
        loadFancyList(serverUrl + 'survey.html');
    }

    $scope.loadProvidersLst = function(){

        selected = 'provider';
        $scope.viewTitle = "Providers";
        buildDefFilter();
        loadObjGrid();
    }

    $scope.loadSegmentList = function(){
        selected = 'segment';
        $scope.viewTitle = "Demographic segments";
        buildDefFilter();
        loadObjGrid();
    }

    $scope.loadLogs = function(){
        selected = 'log';
        $scope.viewTitle = "Application Logs";
        buildDefFilter({});
        var extra = {};
        if ($scope.selTen.appObjects !== undefined){
        extra.app = {};
        var c = 0;
        $.each($scope.selTen.appObjects, function(i, a){
            if (a.active === true){
                extra.app[a.appID] = true;
                c++;
            }
        });
        if (c == 0){
            extra.app[$scope.selTen.appObjects[0].appID] = true;
        }
        }
        buildDefFilter(extra);
        loadObjNGrid();
//        loadObjGrid();
    }

    $scope.loadProducts = function(){
        selected = 'product';
        $scope.viewTitle = "Products";
        buildDefFilter();
        loadObjGrid();
    }

    $scope.loadZips = function(){
        selected = 'zip';
        $scope.viewTitle = "Geo Mapping";
        buildDefFilter();
        loadObjGrid();
    }


    $scope.loadStepsLst = function(){
        selected = 'step';
        $scope.viewTitle = "UI Elements";
        var extra = {};
        extra.app = {};
        extra.app[$scope.selTen.apps[0]] = true;
        buildDefFilter(extra);
        loadObjGrid();
    }
    $scope.loadSurveyLst = function(){
        selected = 'survey';
        $scope.viewTitle = "Surveys";
        buildDefFilter();
        loadObjGrid();
    }

    $scope.loadAppLst = function(){
        selected = 'apps';
        $scope.viewTitle = "Applications";
        var extra = {};
        extra.tenant = $scope.selTen.name;
        buildDefFilter(extra);
        loadObjGrid();
    }
    $scope.loadTenantLst = function(){
        selected = 'tenant';
        $scope.viewTitle = "Tenants";
        buildDefFilter();
        loadObjGrid();
    }
    $scope.loadConsumerLst = function(){
        selected = 'consumer';
        $scope.viewTitle = "Consumers";
        buildDefFilter();
        loadObjNGrid();
//        loadObjGrid();
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
                $scope.wrapper = wrap;
                $scope.sortableOptions = {
                    update: function(e, ui){
                        console.log(ui);
                    }
                };
                refreshFilter(m, refreshData);
            });
        });
    }


    function loadObjGrid(){
        var f  = $scope.cleanFilter;
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, f, $http, function(d){
                viewMode = 'grid';
                $scope.colData = m;
                $scope.listData = d;
                $scope.wrapper = serverUrl + 'grid.html';
                buildGrid(m, d);
                refreshFilter(m, refreshData);
            });
        });
    }

    function loadObjNGrid(){
        var f  = $scope.cleanFilter;
        adminservice.loadMeta(selected, $http, function(m){
            adminservice.listObj(selected, f, $http, function(d){
                viewMode = 'grid';
                $scope.colData = m;
                $scope.wrapper = serverUrl + 'spread.html';
                buildNGrid(m, d);
                refreshFilter(m, refreshData);
            });
        });
    }

    $scope.loadProvidersNG = function(){
        selected = 'provider';
        $scope.viewTitle = "Providers";
        buildDefFilter();
        loadObjNGrid();
    }

    function buildNGrid(meta, data) {
        $scope.listData = data;
        $scope.gridcolumns = [];
        //columns.push({field:'head', width:20});
        $.each(meta, function(i, fm){
            var col = {};
            col.field = fm.fldname;
            col.name = fm.label;
            col.enableCellEdit = true;
            col.resizable = true;
            var checkTmpl = '<div><input ng-model="row.entity.' + fm.fldname + '" type="checkbox" ng-change="gridValChange(row.entity, col )"></input></div>';
            var textTmpl = '<div><input ng-model="row.entity.' + fm.fldname + '" type="text" ng-change="gridValChange(row.entity, col )"></input></div>';
            var textareaTmpl = '<div><textarea ng-model="row.entity.' + fm.fldname + '" ng-change="gridValChange(row.entity, col )"></textarea></div>';
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
                    $.each(fm.opts, function(i, o){
                        var optval = fm.optfld !== undefined ? o[fm.optfld] : o;
                        options += '<option value="' + optval + '">'+ optval +'</option>';
                    });

                col.editableCellTemplate = '<div><select ng-model="row.entity.' + fm.fldname + '">' + options + '</select></div>';
            }
            $scope.gridcolumns.push(col);
        });

        $scope.$on('ngGridEventScroll', function(event, obj){
            console.log('scrolling');
        });

        $scope.gridOptions = {
            data: 'listData',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: true,
            virtualizationThreshold: 40,
            columnDefs: 'gridcolumns'
        };
        $scope.gridValChange = function(entity, col){
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
        columns.push({id:'head', width:20});
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

    $scope.viewFlow = function(){
        $scope.viewTitle = "Preview";
        $.each($scope.selTen.appObjects, function(i, a){
          if (a.active == true){
              hideGrid();
              cartservice.setAppObj(a);
              $scope.masterTmpl = rootUrl + a.template;

              $scope.filterOpen = false;
              $scope.wrapper = serverUrl + 'flow.html';
              return;
          }
        });


    }
}
