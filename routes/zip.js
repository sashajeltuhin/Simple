var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'zip';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list zips ", err);
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
    if (vid._id !== null && vid._id !== undefined){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;


    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add zips ", err);
        }
        else{
            res.send(vid);
        }
    });
    }
    else{
        db.insert(colName, vid, function(err, rec){
            if (err !== null){
                handleError(res, "Cannot add consumer ", err);
            }
            else{
                res.send(rec);
            }
        })
    }
}





