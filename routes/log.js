var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'log';

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list actions ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.totalOrders = function(req, res){

    var filter = req.body;
    var  f = [{ $match: {app:filter.app, complete:true, action:'call_end'}}, {$group : {_id: 'app', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.totalOrdersByApp = function(req, res){

    var filter = req.body;
    var  f = [{ $match: {app:  { $in: filter.app }, complete:true, action:'call_end'}}, {$group : {_id: '$app', result:{$sum : 1} } }, {$sort:{result:-1}}];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.statsByProvider = function(req, res){

    var filter = req.body;
    //filter.$prov = {$exists:1};
    var  f = [{ $match: filter}, {$group : {_id: '$prov', result:{$sum : 1} } }, {$sort:{result:-1}}];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.convRate = function(req, res){

    var filter = req.body;
    var  orderf = [{ $match: {app:filter.app, complete:true, action:'call_end'}}, {$group : {_id: 'app', total:{$sum : 1} } }];
    compute(orderf, function(err, orderTotal){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
        var  callf = [{ $match: {app:filter.app, action:'call_end'}}, {$group : {_id: 'app', total:{$sum : 1} } }];
        compute(callf, function(err, callTotal){
            if (err !== null){
                handleError(res, "Cannot add actions ", err);
            }
            else{
                var r = callTotal[0].total > 0 ? orderTotal[0].total/callTotal[0].total*100 : 0;
                res.send({result:r});
            }
        });
        }
    });
}

exports.totalCalls = function(req, res){
    var filter = req.body;
    var  f = [{ $match: {app:filter.app, action:'call_end'}}, {$group : {_id: 'app', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.callTime = function(req, res){
    var filter = req.body;
    var  f = [{ $match: {app:filter.app, action:'call_end'}}, {$group : {_id: 'app', result:{$avg : '$duration'} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.totalRev = function(req, res){
    var filter = req.body;
    var  f = [{ $match: {app:filter.app, complete:true, action:'call_end'}}, {$unwind:'$data'}, {$group : {_id: 'app', result:{$sum : '$data.rev'} } }];
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
            handleError(res, "Cannot add actions ", err);
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            res.send(vid);
        }
    });

}

exports.log = function(action, callback){
    db.setDB(dbname);
    var vid = action;
    var filter = {};
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            if (callback !== undefined){
                callback(err, null);
            }
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            if (callback !== undefined){
                callback(null, vid);
            }
        }
    });

}



