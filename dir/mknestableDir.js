angular.module('cart').directive('mkNest', function($parse) {
    return{
        restrict: 'EA',
        //scope: { listCall: '&lstFn', loadCall: '&loadFn' },
        link: function(scope, elem, attr){
            elem.nestable({
                group: attr.group
            }).on('change', function(e){
                    var obj = elem.nestable('serialize');
                    var fnc = $parse(attr.onchangefn);
                    scope.$apply(function() {
                        fnc(scope, { list: obj});
                    });
                });
        }
    }
}
);
