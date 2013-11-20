
var db = require('../db/dbaccess');
var colName = 'profile';
var defprofilenick = "meyekid";
var dbname = 'meyekidDB';
var fup = require('jquery-file-upload-middleware');
//var upload = require('./upload');

exports.loadprofiledef = function (req, res) {
    db.setDB(dbname);
    var filter = {profNick:defprofilenick};
    db.load(colName, filter, function(err, collection){
        if (err !== null){
            res.send({Error : {text:"Cannot add", det:err}});
        }
        else{
            var pr = collection !==null && collection.length > 0 ? collection[0] : null;
            res.send(pr);
        }
    });
};

exports.loadprofile = function (req, res) {
    db.setDB(dbname);
    var nick = req.param('nick');
    var filter = {nickname:nick};
    db.load(colName, filter, function(err, collection){
        if (err !== null){
            res.send({Error : {text:"Cannot add", det:err}});
        }
        else{
            var pr = collection !==null && collection.length > 0 ? collection[0] : null;
            res.send(pr);
        }
    });
};

exports.loadUser = function(filter, callback){
    db.setDB(dbname);
    db.load(colName, filter, function(err, collection){
        if (err !== null){
            callback(err, null);
        }
        else{
            var pr = collection !==null && collection.length > 0 ? collection[0] : null;
            callback(null, pr);
        }
    });
}

exports.loadprofiles = function (req, res) {
    db.setDB(dbname);
    var filter = db.getFilter(req.body);

    db.load(colName, filter, function(err, collection){
        if (err !== null){
            res.send({Error : {text:"Cannot add", det:err}});
        }
        else{
            res.send(collection);
        }
    });
};

exports.saveprofile = function (req, res) {
    var pr = req.body;
    var filter = {profNick:pr.profNick};
    upsertProfile(filter, pr, function(err, newid){
        if (err !== null){
            res.send({Error : {text:"Cannot add", det:err}});
        }
        else{
            if (newid !== null){
                pr._id = newid;
            }
            res.send(pr);
        }
    });
};

exports.upsertProfile = function(filter, pr, callback){
    db.setDB(dbname);
    db.upsert(colName, pr, filter, callback);
}

exports.upload_file = function(req, res){

}