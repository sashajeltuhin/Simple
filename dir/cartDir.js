angular.module('cart').directive('cartProd', function($q, $routeParams) {

        return{
            restrict: 'E',
            scope: { p: '=prod', fn:'&remCall'},
            template: '<div class="row"><div class="span2" style="cursor: pointer">{{p.title}}</div>' +
                '<div class="span1">${{p.priceNow}}</div></div>',
            link: function(scope, elem, attr){

                elem.on('click', function(){
                    scope.fn({arg1: scope.p});
                });


            }
        }
    }
);

