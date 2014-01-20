var db = require('../db/dbaccess');
var mongo = require('mongodb');
var auth = require('./auth');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'person';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list person ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.loadUser = function(f, callback){
    var filter = db.getFilter(f);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            callback(err, null);
        }
        else{
            if (recs !== undefined && recs.length > 0){
                callback(null, recs[0]);
            }
            else{
                callback("User does not exist", null);
            }
        }
    });
}

exports.save = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var filter = {};
    if (vid._id !== null && vid._id !== undefined){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;


        db.upsert(colName, vid, filter, function(err, newid){
            if (err !== null){
                handleError(res, "Cannot add person ", err);
            }
            else{
                res.send(vid);
            }
        });
    }
    else{
        createPerson(vid, res);
    }
}

function createPerson(p, res){
    p.upass = auth.createPass(p.upass);
    db.insert(colName, p, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot add person ", err);
        }
        else{
            res.send(rec);
        }
    })
}

exports.delete = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var pid = new ObjectID(vid._id);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete user ", err);
        }
        else{
            res.send(pid);
        }
    });
}



