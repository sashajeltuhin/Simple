exports.upload = function(req, res, next){

    var fp = require('jquery-file-upload-middleware');
    fp.fileHandler({
        uploadDir:'./tmp/templates',
        uploadUrl: '/tmp/templates'
    })(req, res, next);

    fp.once('end', function (fileInfo){
        console.log(fileInfo);
    });
}