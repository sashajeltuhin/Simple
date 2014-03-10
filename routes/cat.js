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
var dbname = 'ShopDB';

var colName = 'cats';

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}



exports.list = function (req, res){
    db.setDB(dbname);
    var filter = db.getFilter(req.body);
    
    db.load(colName, filter, function(err, collection){
        if (err !== null){
            handleError(res, "Cannot load cats ", err);
        }
        else{
            res.send(collection);
        }
    });
}

exports.delete = function(req, res){
    db.setDB(dbname);
    var pids = req.param("_id");
    var pid = new ObjectID(pids);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete cat ", err);
        }
        else{
            res.send(pid);
        }
    });
}

exports.addCat = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var filter = {};
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add cat ", err);
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            res.send(vid);
        }
    });

}

exports.total = function(req, res){
    db.setDB(dbname);
    var filter = req.query;
    db.count(colName, filter, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot count videos ", err);
        }
        else{
            res.send({tot: rec});
        }
    });
}