angular.module('cart').directive('gamePanel', function(cartservice) {

        return{
            restrict: 'E',
            scope: { data: '=stats', meta:'=step'},
            template: '<div class="gameHead">{{meta.prompt}}</div>' +
                      '<div class="row ladderHead">Standings</div>' +
                        '<div class="row ladder" ng-repeat="s in data.ladder">' +
                        '<div class="span2" ng-class="updateLadder(s)">{{s._id}}</div>' +
                        '<div class="span1">{{s.result}}</div>' +
                        '</div>'+
                        '<div class="row ladderHead">Your stats</div>' +
                        '<div class="row">' +
                        '<div class="span2">Call time:</div>' +
                        '<div class="span1">{{data.calltime}}</div>' +
                        '</div>' +
                    '<div class="row">' +
                    '<div class="span2">Orders:</div>' +
                    '<div class="span1">{{data.orders}}</div>' +
                    '</div>'  +
                    '<div class="row">' +
                    '<div class="span2">Conv %:</div>' +
                    '<div class="span1">{{data.conv}}</div>' +
                    '</div>',
            link: function(scope, elem, attr){
                var options = scope.$eval(attr.dragOptions); //allow options to be passed in
                elem.draggable(options);
                scope.updateLadder = function(s){
                        if(cartservice.getApp() == s._id){
                            return "yourScore";
                        }
                        return "";
                    }

            }
        }
    }
);


