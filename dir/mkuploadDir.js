angular.module('cart').directive('mkUpload', function() {

    return{
        restrict: 'EA',
        scope: { uplfnc: '&mkUpfnc'},
        template: '<input class="mk_profImg" type="file" name="files[]" multiple/><div style="btn" style="position: relative ;cursor: pointer;width: 100%;height: 100%">Upload</div>' +
                '<div class="bar" style="width: 0%;background: green;height: 18px"></div>',
        link: function(scope, elem, attr){
            var input = angular.element(elem.children()[0]);
            var div = angular.element(elem.children()[1]);
            elem.css({'cursor':'pointer'});
            var bar = angular.element(elem.children()[2]);
            input.fileupload({
                url:'/profile/upload',
                dataType: 'json',
                done: function (e, data) {
                    bar.css(
                        'width',
                        '0%'
                    );
                    var fileinfo = data.result[0];
                    scope.uplfnc({file:fileinfo.name});
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
