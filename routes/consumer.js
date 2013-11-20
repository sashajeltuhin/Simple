var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var detect = require('./detect');
var dbname = 'ShopDB';

var colName = 'consumer';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list consumer ", err);
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
            handleError(res, "Cannot add consumer ", err);
        }
        else{
            res.send(vid);
        }
    });
    }
    else{
        createConsumer(vid, res);
//        if (vid.IP !== undefined){
//            detect.requestInfo(vid.IP, function(code, obj){
//                vid.isp = obj.isp;
//                vid.org = obj.org;
//                createConsumer(vid, res);
//            });
//        }
//        else{
//            createConsumer(vid, res);
//        }

    }
}

function createConsumer(cons, res){
    db.insert(colName, cons, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot add consumer ", err);
        }
        else{
            res.send(rec);
        }
    })
}

exports.peopleByType = function(req, res){

    var filter = req.body;
    var  f = [{ $match: {tenant:filter.tenant}}, {$group : {_id: '$type', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.abandons = function(req, res){

    var filter = req.body;
    var fobj = {tenant:filter.tenant};
    if (filter.app !== undefined){
        fobj.app = filter.app;
    }
    var  f = [{ $match: fobj}, {$group : {_id: '$lastStep', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

var compute = function(filter, callback){
    db.setDB('ShopDB');
    db.aggregate(colName, filter, function(err, recs){
        if (err !== null){
            callback(err, recs);
        }
        else{
            callback (null, recs);
        }
    });
}






