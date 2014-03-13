var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'step';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list steps ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.save = function(req, res){
    db.setDB(dbname);
    var v = req.body;
    var vid = v.obj;
    var filter = v.filter;

    if (vid == undefined){
        vid = v;
    }
    if (filter !== undefined){
        filter = db.getFilter(filter).query;
    }


    if (filter !== undefined || (vid._id !== null && vid._id !== undefined)){
        if (filter == undefined){
            filter = {};
            filter._id = new ObjectID(vid._id);
            vid._id = filter._id;
        }


        db.upsert(colName, vid, filter, function(err, newid){
            if (err !== null){
                handleError(res, "Cannot update step ", err);
            }
            else{
                res.send(vid);
            }

        });
    }
    else
    {
        db.insert(colName, vid, function(err, rec){
            if (err !== null){
                handleError(res, "Cannot add step ", err);
            }
            else{
                console.log("new step", rec);
                res.send(rec);
            }
        });
    }
}

exports.update = function(widget, callback){
    var filter = {};
    if (widget._id !== undefined){
        filter._id = new ObjectID(widget._id);
    }
    db.upsert(colName, widget, filter, function(err, newid){
        if (err !== null){
            callback(err, null);
        }
        else{
            callback(null, widget);
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
            handleError(res, "Cannot delete step ", err);
        }
        else{
            res.send(pid);
        }
    });
}



