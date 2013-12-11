var topUrl = 'http://localhost';
var myapp = angular.module("cart", ['ui.sortable','ui.date','ngGrid'], function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);//.hashPrefix('!');
    $routeProvider.when('/offer', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: chatprodctrl
    }).when('/survey', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: surveyctrl
        }).when('/cust', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: shadowctrl
    }).when('/qual', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: shadowctrl
        }).when('/teaser', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: teaserctrl
        }).when('/order', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: shadowctrl
        }).when('/inst', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: shadowctrl
        }).when('/credit', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: shadowctrl
        }).when('/conf', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: shadowctrl
        })
        $routeProvider.when('/', {
            templateUrl: 'templ/admin.html',
            controller: adminctrl
        }).when('/admin', {
            templateUrl: 'templ/admin.html',
            controller: adminctrl
        }).otherwise({redirectTo: '/'});

});





