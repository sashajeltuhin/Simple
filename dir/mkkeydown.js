angular.module('cart').directive('mkKeydown',  function ($parse) {
    return function (scope, element, attrs) {
        element.bind("keydown keypress mousedown", function (event) {
            var position = element[0].selectionStart;//window.getSelection().getRangeAt(0).startOffset;
            var fnc = $parse(attrs.mkKeydown);
            event.position = position;
            scope.$apply(function() {
                fnc(scope, { $event: event, $params: event });
            });
//            if(event.which === 13) {
////                scope.$apply(function (){
////                    scope.$eval(attrs.mk-keydown);
////                });
//
//                event.preventDefault();
//            }
        });
    };
});