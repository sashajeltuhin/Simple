var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'apps';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list app ", err);
        }
        else{
            res.send(recs);
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
            handleError(res, "Cannot add app ", err);
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            res.send(vid);
        }
    });

}

exports.delete = function(req, res){
    db.setDB(dbname);
    var vid = req.body;
    var pid = new ObjectID(vid._id);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete app ", err);
        }
        else{
            res.send(pid);
        }
    });
}





