angular.module('cart').directive('mkUpload', function($parse) {

    return{
        restrict: 'EA',
        //scope: { path: '&path', fnc: '&fnc'},
        template: '<input class="mk_profImg" type="file" name="files[]" multiple/><div style="btn" style="position: relative ;cursor: pointer;width: 100%;height: 100%">{{mkUploadLabel}}</div>' +
                '<div class="bar" style="width: 0%;background: green;height: 18px"></div>',
        link: function(scope, elem, attr){
            scope.mkUploadLabel = attr.label;
            var input = angular.element(elem.children()[0]);
            var div = angular.element(elem.children()[1]);
            elem.css({'cursor':'pointer'});
            var bar = angular.element(elem.children()[2]);
            input.fileupload({
                url: attr.path,
                dataType: 'json',
                done: function (e, data) {
                    bar.css(
                        'width',
                        '0%'
                    );
                    var fileinfo = data.result[0];
                    var fnc = $parse(attr.fnc);
                    scope.$apply(function() {
                        fnc(scope, { $event: fileinfo, $params: fileinfo });
                    });
                    //scope.fnc({arg1: fileinfo});
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    bar.css(
                        'width',
                        progress + '%'
                    );
                }
            });
            div.on('click', function(){
                input.click();
            });
        }
    }
}
);
