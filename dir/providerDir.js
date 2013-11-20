angular.module('cart').directive('provider', function($q, $routeParams) {

        return{
            restrict: 'E',
//            scope: { src: '@mkImgsrc', uplfnc: '&mkUpfnc', pid:'@pid'},
            template: '<div class="row"><div class="span2"><img src="{{i.logo}}" width="40" height="40"/> </div><div class="span6"><h3>{{i.title}}</h3><h4>{{i.desc}}</h4></div>' +
                '</div> ' +
                '</div>',
            link: function(scope, elem, attr){

                //doWork(scope, elem);


            }
        }
    }
);

