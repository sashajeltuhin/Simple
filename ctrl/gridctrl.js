function gridctrl($scope, $http, adminservice){

    var viewMode = "grid";
    var serverUrl = topUrl + adminURL + '/templ/';
    var selected = '';
    $scope.rootUrl = topUrl;
    $scope.defFilter = {};
    $scope.gridData = [];
    $scope.gridcolumns = [];

    $scope.gridOptions = {
        data: 'gridData',
        enableCellSelection: true,
        enableRowSelection: false,
        enableCellEdit: true,
        enableColumnResize: true,
        virtualizationThreshold: 40,
        columnDefs: 'gridcolumns'
    };
    var filterdata = adminservice.getFilterData();
    selected = filterdata.objname;
    $scope.defFilter = filterdata.f;
    $scope.selFilter = $scope.defFilter;
    loadObjNGrid(filterdata.customfields);

    $scope.adminPage = serverUrl + "admin.html";

    $scope.$on("EV_GRID_INIT", function(event, objname, custom, filter){
        selected = objname;
        $scope.defFilter = filter;
        $scope.selFilter = $scope.defFilter;
        loadObjNGrid(custom);
    });

    $scope.export = function(){
        var f = cleanFilter();
        adminservice.export(f, selected, $http, function(d){

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
        var f = cleanFilter();
        adminservice.listObj(selected, f, $http, function(d){
            $scope.gridData = d;

        });

    }

    function cleanFilter(){
        return adminservice.cleanFilter($scope.selFilter);
    }

    function clearFilter(){
        $scope.selFilter = $scope.defFilter;
        refreshData();
    }


    $scope.import = function(){
        adminservice.setSelected(selected);
        $scope.viewTitle = "Import " + $scope.viewTitle;
        hideGrid();
        $scope.wrapper = serverUrl + "columnMap.html";
    }




    function loadObjNGrid(customFields){
        if (selected == ''){
            return;
        }
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
                    loadListBindNGGrid(m);
                }, custfilter);
            }, metafilter);
        }
        else{
            adminservice.loadMeta(selected, $http, function(m){
                loadListBindNGGrid(m);
            });
        }
    }

    function loadListBindNGGrid(m){
        var f = cleanFilter($scope.selFilter);
        adminservice.listObj(selected, f, $http, function(d){
            viewMode = 'grid';
            var filterData = {}
            filterData.m = m;
            filterData.f = $scope.selFilter;
            adminservice.setFilterData(filterData);
            buildNGrid(m, d);
        });
    }

    function buildNGrid(meta, data) {

        $scope.$broadcast("EV_FILTER_REBUILD", meta, $scope.selFilter);
        $scope.subTools = serverUrl + 'gridTools.html';
        $scope.gridData = data;
        $scope.gridcolumns = [];
        var rowSelector = {};
        rowSelector.field = "mk_rowsel";
        rowSelector.displayName = " ";
        rowSelector.editableCellTemplate = '<div><input ng-model="row.entity.mk_rowsel" type="checkbox" ng-change="gridValChange(row.entity, col )"></div>';
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
//            console.log('scrolling');
        });

        $scope.gridOptions = {
            data: 'gridData',
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


}
