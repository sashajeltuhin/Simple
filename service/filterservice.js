angular.module('cart').factory('mkFilter', ["$document", "$compile", "$rootScope", "$controller", "$timeout", "$q", "$http", "adminservice",
    function ($document, $compile, $rootScope, $controller, $timeout, $q, $http, adminservice) {

        var service = {};
        service.defaults = {
            id: null,
            template: null,
            title: 'Toolbox',
            search: {label: 'Search', fn: null},
            clear: {label: 'Clear', fn: null},
            controller: null, //just like route controller declaration
            footerTemplate: null,
            modalClass: "",
            css: {
                'oveflow': 'scroll'
            }
        };
        service.filterEl = null;
        service.filterObj = null;

        service.isInit = function(){
            this.filterEl !== null;
        }

        service.openFilterBar = function(options, passedInLocals) {

            options = angular.extend({}, this.defaults, options); //options defined in constructor

            if (this.filterEl !== null){
                this.filterEl.remove();
                this.filterEl = null;
            }

            this.filterObj = options.filterObj;

            var buildTemplate = function(meta, filter){

                var top = $('<div></div>');
                for(var key in meta){
                    var metafld = meta[key];
                    if (metafld.reportable == true){

                        if (metafld.opts !== undefined){
                                var block = $('<div class="control-group"><label class="control-label style4">' + metafld.label + '</label></div>').appendTo(top);
                                var w =  $('<div class="controls"></div>').appendTo(block);
//                            var fresh = false;
                            console.log(filter[metafld.fldname]);
                            if (filter[metafld.fldname] == undefined){
                                filter[metafld.fldname] = {};
//                                fresh = true;
                            }
                                $.each(metafld.opts, function(i, item){
                                    var optval = metafld.optfld !== undefined ? item[metafld.optfld]: item;
                                    filter[metafld.fldname][optval] = filter[metafld.fldname][optval] !== undefined && filter[metafld.fldname][optval] == true;
//                                    if (i == 0 && fresh == true){
//                                        filter[metafld.fldname][optval] = true;
//                                    }
                                    var lbl = $('<label class="control-label">' + optval+ '</label>').appendTo(w);
                                    var chk = $('<input type="checkbox" ng-model="selFilter.' + metafld.fldname + '.' + optval + '">').appendTo(lbl);
                                });
                            continue;
                        }

                        var block = $('<div class="control-group"><label class="control-label style4">' + metafld.label + '</label></div>').appendTo(top);
                        var w =  $('<div class="controls"></div>').appendTo(block);
                        var inputtype = 'text';
                        switch (metafld.fldtype){
                            case 'bool':
                                inputtype = 'checkbox';
                                break;
                        }
                        if (filter[metafld.fldname] == undefined){
                            filter[metafld.fldname] = "";
                        }
                        var ed = '<input type="' + inputtype + '" ng-model="selFilter.' + metafld.fldname + '" style="width:100px" >';
                        $(ed).appendTo(w);
                    }

                }
                return top.html();

            }

            var body = $document.find(options.parentCtrl);
            var key;
            var idAttr = options.id ? ' id="' + options.id + '" ' : '';
            var defaultFooter = '<button class="btn" ng-click="$filterCancel()">{{$filterCancelLabel}}</button>' +
                '<button class="btn btn-primary" ng-click="$filterSearch()">{{$filterSuccessLabel}}</button>';
            var footerTemplate = '<div>' +
                (options.footerTemplate || defaultFooter) +
                '</div>';
            var defHeader = footerTemplate;
            var filterBody = (function(){
                if(options.template){
                    if(angular.isString(options.template)){
                        // Simple string template
                        return '<div>' + options.template + '</div>';
                    } else {
                        // jQuery/JQlite wrapped object
                        return '<div>' + options.template.html() + '</div>';
                    }
                } else {
                    // dynamic
                    return buildTemplate(options.meta, options.filter);
                }
            })();
            //We don't have the scope we're gonna use yet, so just get a compile function for modal
            this.filterEl = angular.element(
                '<div class="' + options.modalClass + '"' + idAttr + '>' +
                    '  <div>' +
//                    '    <button type="button" class="close" ng-click="$filterCancel()">&times;</button>' +
                    '    <h4>{{$filterHead}}</h4>' +
                    '  </div>' +
                    defHeader +
                    filterBody +
                    footerTemplate +
                    '</div>');

            for(key in options.css) {
                this.filterEl.css(key, options.css[key]);
            }


            var ctrl, locals,
                scope = options.scope || $rootScope.$new();

            scope.$filterHead = options.title;
            //scope.$modalClose = closeFn;
            scope.$filterCancel = function () {
                var callFn = options.clear.fn;
                callFn.call(this);

            };
            scope.$filterSearch = function () {
                var callFn = options.search.fn;
                callFn.call(this);

            };
            scope.$filterSuccessLabel = options.search.label;
            scope.$filterCancelLabel = options.clear.label;

            if (options.controller) {
                locals = angular.extend({$scope: scope}, passedInLocals);
                ctrl = $controller(options.controller, locals);
                // Yes, ngControllerController is not a typo
                this.filterEl.contents().data('$ngControllerController', ctrl);
            }

            $compile(this.filterEl)(scope);

            body.append(this.filterEl);
            $timeout(function () {
                service.filterEl.addClass('in');
            }, 200);
        };


        return service;
    }]);
