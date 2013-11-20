/**
 * Created with JetBrains WebStorm.
 * User: sashajeltuhin
 * Date: 3/20/13
 * Time: 12:14 AM
 * To change this template use File | Settings | File Templates.
 */
var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var colName = 'labels';
var mod = this;

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
       db.setDB('ShopDB');
    var name = req.param("obj");
    var filter = {objname : name};

        db.load(colName, filter, function(err, recs){
            if (err !== null){
                handleError(res, "Cannot list products ", err);
            }
            else{
                    res.send(recs);
            }
        });
}


exports.delete = function(req, res){
    db.setDB('ShopDB');
    var pids = req.param("_id");
    var pid = new ObjectID(pids);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete product ", err);
        }
        else{
            res.send(pid);
        }
    });
}

var upsertLabel = function(fld, filter, callback){
    db.setDB('ShopDB');
    db.upsert(colName, fld, filter, callback);
}

exports.upsert = function(req, res){
    db.setDB('ShopDB');
    var vid = req.body;
    var filter = {};
    if (vid._id !== null && vid._id != undefined){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;

        upsertLabel( vid, filter, function(err, newid){
            if (err !== null){
                handleError(res, "Cannot add label ", err);
            }
            else{
                vid._id = newid;
                res.send(vid);
            }
        });
    }
    else{
        db.insert(colName, vid, function(err, rec){
            if (err !== null){
                handleError(res, "Cannot add labels ", err);
            }
            else{
                res.send(rec);
            }
        });
    }

}

exports.total = function(req, res){
    db.setDB('ShopDB');
    var filter = req.query;
    db.count(colName, filter, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot count products ", err);
        }
        else{
            res.send({tot: rec});
        }
    });
}