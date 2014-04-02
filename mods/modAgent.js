var topUrl = 'http://localhost';
var myapp = angular.module("cart", ['ui.sortable','ui.date','ngGrid','ngCookies'], function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);//.hashPrefix('!');
    $routeProvider.when('/app/:id', {
        template: '<div ng-include="templateUrl">Loading...</div>'
    }).when('/offer', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: agentprodctrl
    }).when('/call', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: salesctrl
        }).when('/survey', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: surveyctrl
        }).when('/cust', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: orderctrl
    }).when('/qual', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        }).when('/teaser', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: teaserctrl
        }).when('/order', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        }).when('/inst', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        }).when('/credit', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        }).when('/tpv', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        }).when('/conf', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: orderctrl
        })
        .otherwise({redirectTo: '/'});

});





