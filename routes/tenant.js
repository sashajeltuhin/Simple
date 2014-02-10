var db = require('../db/dbaccess');
var mongo = require('mongodb');
var auth = require('./auth');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'tenant';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB(dbname);
    var userFilter = req.body;
    var secFilter = {_id: 'tenants'};
//    auth.applyRowFilter(req, res, userFilter, secFilter);

    var filter = db.getFilter(userFilter);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list tenant ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.loadByID = function(tid, callback){
    db.setDB(dbname);
    var filter = db.getFilter({_id: tid});
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            callback(err, null);
        }
        else{
            callback(null, recs);
        }
    });
}

exports.save = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var filter = {};
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add tenant ", err);
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            res.send(vid);
        }
    });

}






