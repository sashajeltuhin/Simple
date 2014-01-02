exports.upload = function(req, res, next){

    var fp = require('jquery-file-upload-middleware');
    fp.fileHandler({
        uploadDir:'./tmp/files',
        uploadUrl: '/tmp/files'
    })(req, res, next);

    fp.once('end', function (fileInfo){
        console.log(fileInfo);
    });
}