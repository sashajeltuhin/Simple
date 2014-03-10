var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB'; //'meyekidDB';
var metacache = [];

var setDBName = function(name){
    dbname = name;
}

var getDB = function (c1, callback) {
    var Server = mongo.Server,
        Db = mongo.Db;
    var server = new Server('localhost', 27017, { w:1, auto_reconnect:true});

    db = new Db(dbname, server, {safe:true});
    db.open(function (err, db) {
        if (err != null) {
            handleError("Error opening the database", err, c1);
        }
        else {
            console.log("connected to " + dbname);
            callback(null, db);
        }

    });
}

var handleError = function(msg, err, callback, db){
    if (err != null){
        if (db !== null && db !== undefined){
            db.close();
        }
        var txt = msg + '. ' + err;
        console.log(txt);
        callback(txt);
    }
}

var loadData = function(db, col, filter, callback){
    if(filter.distinct !== undefined){
        col.distinct(filter.distinct, filter.query, function(err, items) {
            db.close();
            if (err != null){
                handleError('Enable to load list of videos', err, callback);
            }
            else{
                callback(null, items);
            }
        });
    }
    else{
        col.find(filter.query).skip(filter.skip).limit(filter.limit).sort(filter.order_by).toArray(function(err, items) {
            db.close();
            if (err != null){
                handleError('Enable to load list of videos', err, callback);
            }
            else{
                callback(null, items);
            }
        });
    }
}


exports.setDB = function(name){
    dbname = name;
}

var prepFilter = function(f){
    var filter = {};
    filter.query = {};
    filter.order_by = {};
    filter.skip = 0;
    filter.limit = 0;
    for(var key in f){
        if (key == 'order_by'){
            filter.order_by = f[key];
            continue;
        }
        if (key == 'limit'){
            filter.limit = Number(f[key]);
            continue;
        }
        if (key == 'skip'){
            filter.skip = Number(f[key]);
            continue;
        }
        if (key == 'distinct'){
            filter.distinct = f[key];
            continue;
        }
        var v = f[key];

        if (Array.isArray(v)){
            if (key == '_id'){
                v = convertIDs(v);
            }
            filter.query[key] =  { $in: v };
        }
        else if (v.oper !== undefined && v.val !== undefined && Array.isArray(v.val)){
            if (key == '_id'){
                v.val = convertIDs(v.val);
            }
            if (v.oper == 'in'){
                filter.query[key] =  { $in:v.val };
            }
            else if (v.oper == 'all'){
                filter.query[key] =  { $all:v.val };
            }
            else if (v.oper == '<>'){
                filter.query[key] =  { $nin:v.val };
            }
        }
        else if (String(key) == "_id" || String (key) == 'uid'){
            filter.query[key]  = new ObjectID(v);
        }
        else{
            var str = String(v);
            if (str.indexOf("*") !== -1){
                filter.query[key] =  { $regex: v, $options: 'i' };
            }
            else if (str.indexOf('<') !== -1){
                var num = Number(str.replace('<', ''));
                filter.query[key] =  { $lt: num };
            }
            else if (str.indexOf('>') !== -1){
                var num = Number(str.replace('>', ''));
                filter.query[key] =  { $gt: num };
            }
            else if (str.indexOf('<>') !== -1){
                var vl = str.replace('<>', '');
                filter.query[key] = {$ne: vl};
            }
            else{
                filter.query[key] =  v;
            }
        }
    }
    return filter;
}

function convertIDs(v){
    if (v == undefined){
        return [];
    }
    else{
        var ar = [];
        for(var i = 0; i < v.length; i++){
            ar.push(new ObjectID(v[i]));
        }
        return ar;
    }
}

exports.getFilter = function(f){
    return prepFilter(f);
}


exports.load = function (colname, filter, callback) {
    getDB(callback, function (err, db) {

        db.collection(colname, function (err, collection) {

            if (err) {
                handleError("Enable to access collection", err, callback, db);
            }
            else {
                loadData(db, collection, filter, callback);
            }
        });
    });
};

exports.aggregate = function(colname, filter, callback){
    computeData(colname, filter, callback);
}

var computeData = function(colname, filter, callback){
    getDB(callback, function (err, db) {

        db.collection(colname, function (err, collection) {
            if (err) {
                handleError("Enable to access collection", err, callback, db);
            }
            else {
                collection.aggregate(filter, function(err, results){
                    db.close();
                    if (err){
                        handleError("Enable to aggregate collection", err, callback, db);
                    }
                    else{
                        callback(null, results);
                    }
                })
            }
        });
    });
}

exports.delete = function (colname, filter, callback) {
    getDB(callback, function (err, db) {

        db.collection(colname, function (err, collection) {
            if (err) {
                handleError("Enable to access collection", err, callback, db);
            }
            else {
                collection.remove(filter, function (err, ret) {
                    db.close();
                    if (err) {
                        handleError("Enable to remove record", err, callback);
                    }
                    else {
                        callback(null, ret);
                    }
                });
            }
        });
    });
};

exports.insert = function(colname, obj, callback){
    getDB(callback, function (err, db) {
        db.collection(colname, function (err, collection) {
            if (err !== null) {
                handleError("Enable to access collection", err, callback, db);
            }
            else {
                collection.insert(obj, {w:1}, function(err, rec){
                    db.close();
                    if (err != null) {
                        handleError("Enable add record. ", err, callback, db);
                    }
                    else {
                        if (rec !== null && rec.length > 0) {
                            callback(null, rec[0]);
                        }
                    }
                });
            }
        });
    });
}

exports.upsert = function (colname, rawobj, filter, callback) {
    this.checktypes(rawobj, colname, function(obj){
        getDB(callback, function (err, db) {
            db.collection(colname, function (err, collection) {
                if (err !== null) {
                    handleError("Enable to access collection", err, callback, db);
                }
                else {
                    var upobj = {};
                    for(key in obj){
                        if (key !== "_id"){
                            upobj[key] = obj[key];
                        }
                    }
                    var set = {$set:upobj};
                    collection.update(filter, set, {upsert:true, w:1, multi:true}, function (err, rec, data) {
                        if (err != null) {
                            handleError("Enable add record. ", err, callback, db);
                        }
                        else {
                            db.close();
                            if (rec > 0 && data != null) {
                                callback(null, data.upserted);
                            }
                        }
                    });
                }
            });
        });
    });

}

exports.compute = function(req, res){
    setDBName(dbname);
    var  f = [{ $match: {app:  { $in: filter.app }, complete:true, action:'call_end'}}, {$group : {_id: '$app', result:{$sum : 1} } }, {$sort:{result:-1}}];
    var colName = req.body.obj;
    var filter = req.body.filter;
    var groupBy = req.body.groupBy;
    var func = req.body.function;
    var funcField = req.body.funcField;
    var order_by = req.body.order_by;
    var  f = [{ $match: filter}, {$group : group }];
    computeData(colName, filter, function(err, recs){
        if (err !== null){
            callback(err, recs);
        }
        else{
            callback (null, recs);
        }
    });
}


exports.total = function(req, res){
    setDBName(dbname);
    var colName = req.body.obj;
    var f = prepFilter(req.body.filter);
    count(colName, f, function(err, rec){
        if (err !== null){
            res.send({Error : {text:"Cannot provide total ", det:err}});
        }
        else{
            res.send({data: rec});
        }
    });
}

var count = function(colname, filter, callback){
    getDB(callback, function(err, db){
        db.collection(colname, function(err, collection){
            if (err !== null){
                handleError("Enable to access collection", err, callback, db );
            }
            else
            {
                collection.count(filter.query, function(err, rec) {
                    db.close();
                    if (err != null){
                        handleError("Enable to total. ", err, callback, db );
                    }
                    else{

                        callback(null, rec);
                    }
                });
            }
        });
    });
}

exports.count = function(colname, filter, callback){
    count(colname, filter, callback);
}

exports.buildMetaCache = function(dbname, name, callback){
    if(metacache[name] !== undefined && metacache[name].length == 0){
        callback(true);
    }
    else
    {
    this.setDB(dbname);
    this.load('fields', {objname:name}, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            metacache[name]={};
            for(var r = 0; r < recs.length; r++){
                var m = recs[r];
                var key = name + '.' +  m.fldname;
                metacache[key] = m;
            }
            callback(true);
        }
    });
    }
}

exports.checktypes = function(obj, objname, callback){
    this.buildMetaCache(dbname, objname, function(success){
            if (success){
                for(var k in obj){
                    var key = objname + '.' +  k;
                    var f = metacache[key];
                    if(f !== undefined){
                        var ft = f.fldtype.replace(/\W/g, '');
                        if(ft == 'currency'|| ft == 'number'){
                            obj[k] = Number(obj[k]);
                        }
                    }
                }
                callback(obj);
            }
    });
}
