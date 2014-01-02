var fs = require('fs');

exports.saveFile = function(content, fpath, callback){
    fs.writeFile(fpath, content, function(err) {
    if(err) {
        callback(err);
    } else {
        callback(null);
    }
    });
}

exports.readTextFile = function(content, fpath, callback){
    fs.readFile(fpath, 'utf8', function(err, data) {
        if (err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
}