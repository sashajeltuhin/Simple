var topUrl = 'http://localhost';
var myapp = angular.module("cart", [], function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);//.hashPrefix('!');
    $routeProvider.when('/offer', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: prodctrl
    }).when('/survey', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: surveyctrl
        }).when('/teaser', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: teaserctrl
        }).when('/qual', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: teaserctrl
        }).when('/cust', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartctrl
        }).when('/order', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartctrl
        }).when('/pers', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartctrl
        }).when('/inst', {
        template: '<div ng-include="templateUrl">Loading...</div>',
        controller: cartctrl
    }).when('/credit', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartctrl
        }).when('/conf', {
            template: '<div ng-include="templateUrl">Loading...</div>',
            controller: cartctrl
        }).otherwise({redirectTo: chrome.extension.getURL('/')});

});





