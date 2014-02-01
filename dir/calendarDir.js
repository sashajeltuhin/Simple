angular.module('cart').directive('mkCalendar', function() {
        return{
            restrict: 'E',
            scope: { events: '=events'},
            link: function(scope, elem, attr){
                var cTime = new Date(), month = cTime.getMonth()+1, year = cTime.getFullYear();

                theMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                theDays = ["S", "M", "T", "W", "T", "F", "S"];
                var reload = function() {
                    elem.calendar({
                        months: theMonths,
                        days: theDays,
                        events: scope.events,
                        popover_options:{
                            placement: 'top',
                            html: true
                        }
                    });
                }
                scope.$watch('events', reload);

            }
        }
    }
);
