var topUrl = 'http://localhost';
var myapp = angular.module("cart", ['ui.sortable','ui.date','ngGrid','ngSanitize', 'ngCookies'], function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);//.hashPrefix('!');
    $routeProvider.when('/:id', {
        template: '<div ng-include="templateUrl">Loading...</div>'
    }).when('/offer', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: prodctrl
    }).when('/survey', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: surveyctrl
        }).when('/cust', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: cartadminctrl
    }).when('/qual', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartadminctrl
        }).when('/teaser', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: teaserctrl
        }).when('/order', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartadminctrl
        }).when('/inst', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartadminctrl
        }).when('/credit', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartadminctrl
        }).when('/conf', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartadminctrl
        })
        $routeProvider.when('/', {
            templateUrl: 'templ/admin.html',
            controller: adminctrl
        }).when('/admin', {
            templateUrl: 'templ/admin.html',
            controller: adminctrl
        }).otherwise({redirectTo: '/'});

});





