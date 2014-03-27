var db = require('../db/dbaccess');
var mongo = require('mongodb');
var auth = require('./auth');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'user';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB(dbname);
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
    db.setDB(dbname);
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
    db.saveData(dbname, colName, req, res, onInsert);
}


function onInsert(p){
    p.upass = auth.createPass(p.upass);
}

exports.delete = function(req, res){
    db.deleteData(dbname, colName, req, res);
}



