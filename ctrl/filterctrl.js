function filterctrl($scope){
    var serverUrl = topUrl + adminURL + '/templ/';
    var templUrl = serverUrl + 'ctrls/';
    $scope.rootUrl = topUrl;
    var origFilter = {};
    var origMeta = [];

    $scope.$on("EV_FILTER_REBUILD", function(event, meta, filter){
        origMeta = meta;
        origFilter = filter;
        $scope.filter = filter;
        reload(meta, $scope.filter);
    });

    $scope.load = function(){
        for (var i = 0; i < $scope.fieldList.length; i++){
            var fd = $scope.fieldList[i];
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
        $scope.fieldList = [];
        for(var key in meta){
            var metafld = meta[key];
            if (metafld.reportable == true){
                var fd = {};
                $scope.fieldList.push(fd);
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
                        filter[metafld.fldname][optval] = filter[metafld.fldname][optval] !== undefined && filter[metafld.fldname][optval] == true;
                        opt.optvalue = filter[metafld.fldname][optval];
                        opt.label = optval;
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