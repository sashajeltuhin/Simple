/**
 * Created with JetBrains WebStorm.
 * User: sashajeltuhin
 * Date: 3/27/13
 * Time: 8:30 PM
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'meyekidDB';
var metacache = [];

exports.setDB = function(name){
    dbname = name;
}

exports.getFilter = function(f){
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
            filter.query[key] =  { $in: v };
        }
        else if (String(key) == "_id"){
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
            else{
                filter.query[key] =  v;
            }
        }
    }
    return filter;
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
};

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
};


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

};

exports.count = function(colname, filter, callback){
    getDB(callback, function(err, db){
        db.collection(colname, function(err, collection){
            if (err !== null){
                handleError("Enable to access collection", err, callback, db );
            }
            else
            {
                collection.count(filter, function(err, rec) {
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

exports.buildMetaCache = function(dbname, name, callback){
    if(metacache[name] !== undefined){
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
                        if(f.fldtype == 'currency'|| f.fldtype == 'number'){
                            obj[k] = Number(obj[k]);
                        }
                    }
                }
                callback(obj);
            }
    });
}
