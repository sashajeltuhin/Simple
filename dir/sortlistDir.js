angular.module('cart').directive('sortList', function($q, $routeParams) {

        return{
            restrict: 'E',
            scope: { list: '@itList'},
            template: ' <provider class="sortable" ng-repeat="i in list"></provider>',
            link: function(scope, elem, attr){
                elem.sortable().bind('sortupdate', function() {
                    //Triggered when the user stopped sorting and the DOM position has changed.
                });
            }
        }
    }
);
