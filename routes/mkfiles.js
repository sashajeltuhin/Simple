var fs = require('fs');
var mkdirp = require('mkdirp');

exports.saveFile = function(content, fpath, callback){
    fs.writeFile(__dirname + fpath, content, function(err) {
    if(err) {
        console.log("file: ", __dirname + fpath);
        console.log("error: ", err);
        callback(err);
    } else {
        callback(null);
    }
    });
}

exports.createDirs = function(fpath, callback){
    mkdirp(__dirname + fpath, function (err) {
        if (err){
            callback(err);
        }
        else {
            callback(null);
        }
    });
}

exports.readTextFile = function(content, fpath, callback){
    fs.readFile(__dirname + fpath, 'utf8', function(err, data) {
        if (err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
}