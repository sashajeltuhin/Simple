

exports.imgup = function(req, res, next){

    var fp = require('jquery-file-upload-middleware');
    fp.fileHandler({
        uploadDir:'./static/tmp/profile',
        uploadUrl: '/static/tmp/profile',
        imageVersions: {
            thumbnail: {
                width: 40,
                height: 40
            }
        }
    })(req, res, next);

    fp.once('end', function (fileInfo){
        console.log(fileInfo);
    });
}


