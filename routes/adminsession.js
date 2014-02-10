var db = require('../db/dbaccess');
var mongo = require('mongodb');
var tenant = require('./tenant');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'session';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB(dbname);
    var filter = db.getFilter(req.body);
    console.log("consumer filter: ", filter);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list session ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.loadSessionbyID = function(f, callback){
    db.setDB(dbname);
    var filter = db.getFilter(f);
    console.log("consumer filter: ", filter);
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
    if (vid._id !== null && vid._id !== undefined){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;


    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add session ", err);
        }
        else{
            res.send(vid);
        }
    });
    }
    else{
        createSession(vid, res);
    }
}

exports.newSession = function(user, callback){
    db.setDB(dbname);
    var session = {};
    session.uid = user._id;
    session.tid = user.tid;
    session.fname = user.fname;
    session.lname = user.lname;
    session.imageUrl = user.imageUrl;
    session.time = new Date();
    db.insert(colName, session, function(err, rec){
        if (err !== null){
            callback(err, null);
        }
        else{
            callback(null, rec);
        }
    })
}

exports.getTimeOut = function(s, callback){
    tenant.loadByID(s.tid, function(err, t){
        if(err !== null){
            callback(-1);
        }
        else if (t.length > 0 && t[0].sessionTimeout !== undefined){
            callback(t[0].sessionTimeout);
        }
        else{
            callback(-1);
        }
    })
}


function createSession(cons, res){
    db.insert(colName, cons, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot add session ", err);
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




