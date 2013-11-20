angular.module('cart').directive('chart', function() {
        return{
            restrict: 'E',
            scope: { data: '=data', opt: '=opt'},
            template: ' <div style="min-width: 310px; height: 400px; margin: 20px"></div>',
            link: function(scope, elem, attr){

                var paintChart = function() {
                    console.log(attr.data);
                    console.log(attr.opt);
                    if (scope.data !== undefined){
                    elem.highcharts({
                        chart: {
                            type: 'column'
                        },
                        credits: {
                            enabled: false
                        },
                        title: {
                            text: scope.data.title
                        },
                        subtitle: {
                            text: scope.data.subtitle
                        },
                        xAxis:{
                            categories: scope.data.cats
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: scope.data.ytext
                            }
                        },
//                    tooltip: {
//                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//                            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
//                        footerFormat: '</table>',
//                        shared: true,
//                        useHTML: true
//                    },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: scope.data.sers
                    });
                    }
                }
                scope.$watch('data', paintChart);

            }
        }
    }
);
