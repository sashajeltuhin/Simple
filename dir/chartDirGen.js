angular.module('cart').directive('chartGen', function() {
        return{
            restrict: 'E',
            scope: { opt: '=opt'},
            template: ' <div style="min-width: 310px; height: 400px; margin: 20px"></div>',
            link: function(scope, elem, attr){

                var paintChart = function() {
                    console.log(attr.opt);
                    elem.highcharts(scope.opt);
                }
                scope.$watch('opt', paintChart);

            }
        }
    }
);
