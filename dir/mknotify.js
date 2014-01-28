angular.module('cart').directive('mkNotify', function() {
        return{
            restrict: 'E',
            scope: { num: '=num'},
            template: ' <span class="badge badge-sm up bg-danger m-l-n-sm">{{num}}</span>',
            link: function(scope, elem, attr){
                var paintBadge = function() {
                    console.log(attr.num);
                    elem.fadeOut().fadeIn();
                }
                scope.$watch('num', paintBadge);

            }
        }
    }
);
