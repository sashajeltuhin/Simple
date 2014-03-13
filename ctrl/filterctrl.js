function filterctrl($scope, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var templUrl = serverUrl + 'ctrls/';
    $scope.rootUrl = topUrl;
    var origFilter = {};
    var origMeta = [];

    var filterdata = adminservice.getFilterData();
    if (filterdata.m !== undefined && filterdata.f !== undefined){
        origMeta = filterdata.m;
        origFilter = filterdata.f;
        $scope.filter = filterdata.f;
        reload(filterdata.m, $scope.filter);
    }

    $scope.$on("EV_FILTER_REBUILD", function(event, meta, filter, title){
        origMeta = meta;
        origFilter = filter;
        $scope.filterName = title;
        $scope.filter = filter;
        reload(meta, $scope.filter);
    });

    $scope.load = function(){
        for (var i = 0; i < $scope.filterList.length; i++){
            var fd = $scope.filterList[i];
            if (fd.options !== undefined){
                for(var o=0; o < fd.options.length; o++){
                    var opt = fd.options[o];
                    $scope.filter[fd.fldname][opt.label] = opt.optvalue;
                }
            }
            else{
                $scope.filter[fd.fldname] = fd.fldvalue;
            }

        }
        $scope.$emit("EV_FILTER_APPLY", $scope.filter);
    }

    $scope.reset = function(){
        $scope.$emit("EV_FILTER_RESET");
        reload(origMeta, origFilter);
    }

    function reload(meta, filter){
        $scope.filterList = [];
        for(var key in meta){
            var metafld = meta[key];
            if (metafld.reportable == true){
                var fd = {};
                $scope.filterList.push(fd);
                fd.label = metafld.label;
                fd.fldname = metafld.fldname;
                if (metafld.opts !== undefined){
                    if (filter[metafld.fldname] == undefined){
                        filter[metafld.fldname] = {};
                    }
                    fd.options = [];
                    fd.template = templUrl + 'checklist.html';
                    $.each(metafld.opts, function(i, item){
                        var opt = {};
                        fd.options.push(opt);

                        var optval = metafld.optfld !== undefined ? item[metafld.optfld]: item;
                        var optdesc = metafld.optlabel !== undefined && metafld.optlabel !== "" ? item[metafld.optlabel]: optval;
                        filter[metafld.fldname][optval] = filter[metafld.fldname][optval] !== undefined && filter[metafld.fldname][optval] == true;
                        opt.optvalue = filter[metafld.fldname][optval];
                        opt.label = optdesc;
                    });
                }
                else {
                        switch (metafld.fldtype){
                            case 'text':
                                fd.template = templUrl + 'text.html';
                                break;
                            case 'bool':
                                fd.template = templUrl + 'checkbox.html';
                                break;
                            default:
                                fd.template = templUrl + 'text.html';
                                break;
                        }
                        if (filter[metafld.fldname] == undefined){
                            filter[metafld.fldname] = "";
                        }
                        fd.fldvalue = filter[metafld.fldname];
                }
            }

        }
    }
}