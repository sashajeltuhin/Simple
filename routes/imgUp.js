exports.upload = function(req, res, next){

    var fp = require('jquery-file-upload-middleware');
    fp.fileHandler({
        uploadDir: './tmp/images',
        uploadUrl: '/tmp/images'
    })(req, res, next);

    fp.once('error', function (err){
        console.log(err);
    });

    fp.once('end', function (fileInfo){
        console.log(fileInfo);
    });
}