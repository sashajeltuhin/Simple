var db = require('../db/dbaccess');
var mongo = require('mongodb');
var auth = require('./auth');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';
var io = require('./mkfiles');

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
    if (vid._id !== undefined && vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
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
    else{
        vid.startDate = new Date();
        db.insert(colName, vid, function(err, rec){
            if (err !== null){
                handleError(res, "Cannot add provider ", err);
            }
            else{
                io.createDirs('/../tenants/'+ vid.name+ '/assets/css', function(err){
                    console.log('css dir error:', err);
                });
                io.createDirs('/../tenants/'+ vid.name+ '/assets/img', function(err){
                    console.log('img dir error:', err);
                });
                io.createDirs('/../tenants/'+ vid.name+ '/assets/js', function(err){
                    console.log('js dir error:', err);
                });
                res.send(rec);
            }
        });
    }

}


exports.delete = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var pid = new ObjectID(vid._id);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete object ", err);
        }
        else{
            res.send(pid);
        }
    });
}






