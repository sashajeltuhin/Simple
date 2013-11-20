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
var dbname = 'meyekidDB';

var colName = 'video';

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.listjp = function (req, res) {
    db.setDB(dbname);
    db.load(function(err, collection){
        var obj = { title:'Express' };
        res.send(req.query.callback + '(' + JSON.stringify(collection) + ');');
    });
};

exports.list = function (req, res){
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
}

exports.delete = function(req, res){
    db.setDB(dbname);
    var pids = req.param("_id");
    var pid = new ObjectID(pids);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete video ", err);
        }
        else{
            res.send(pid);
        }
    });
}

exports.addVideo = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var filter = {};
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add videos ", err);
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
    var f = db.getFilter(req.body);
    db.count(colName, f, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot count videos ", err);
        }
        else{
            res.send({tot: rec});
        }
    });
}