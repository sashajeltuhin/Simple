angular.module('cart').directive('chartGen', function() {
        return{
            restrict: 'E',
            scope: { opt: '=opt'},
            template: ' <div style="width: 250px; height: 300px; margin: 20px"></div>',
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
