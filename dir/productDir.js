angular.module('cart').directive('listProd', function($q, $routeParams) {
        return{
            restrict: 'E',
            scope: { p: '=prod', fn:'&addCall'},
            template: '<div class="row"><div class="span2"><div><b>{{p.provider}}</b></div>' +
                '<div><img ng-src="{{p.brandimgUrl}}" width="40" height="40"/></div></div>' +
                '<div class="span4"><h3>{{p.title}}</h3><h4>{{p.desc}}</h4></div>' +
                '<div class="span2"><div><b>${{p.priceNow}}</b></div><div class="btn bv_btn-custom">+</div></div> ' +
                '</div>',
            link: function(scope, elem, attr){

                elem.on('click', function(){
                    scope.fn({arg1: scope.p});
                });


            }
        }
    }
);

