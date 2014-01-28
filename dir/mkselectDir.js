angular.module('cart').directive('mkSelect', function($parse) {
    return{
        restrict: 'EA',
        //scope: { listCall: '&lstFn', loadCall: '&loadFn' },
        link: function(scope, elem, attr){
            var multi = attr.multi == "1" ? true: false;

            elem.select2({
                minimumInputLength: 3,
                multiple: multi,
                query: function(c){
                    //scope.listCall({arg1: q});
                    var fnc = $parse(attr.listfn);
                    scope.$apply(function() {
                        fnc(scope, { q: c});
                    });
                }
            }).on('change', function(e){
                    var fnc = $parse(attr.loadfn);
                    scope.$apply(function() {
                        fnc(scope, { id: e.val});
                    });
                });
        }
    }
}
);
