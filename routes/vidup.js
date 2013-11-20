

exports.vup = function (req, res, next) {
    var vp = require('jquery-file-upload-middleware');
    vp.fileHandler({
        uploadDir:__dirname + '/tmp',
        uploadUrl:'/uploads',
        imageVersions:{
            thumbnail:{
                width:40,
                height:40
            }
        }
    })(req, res, next);

    vp.once('end', function (fileInfo) {
        console.log('video' + fileInfo);
    });

};




