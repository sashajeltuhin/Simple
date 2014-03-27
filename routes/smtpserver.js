var db = require('../db/dbaccess');
var secret = require('./mkcrypt');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'smtpserver';

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB(dbname);
    var filter = db.getFilter(req.body);
    console.log("consumer filter: ", filter);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list servers ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.loadConfig = function(f, callback){
    db.setDB(dbname);
    var filter = db.getFilter(f);
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
    db.saveData(dbname, colName, req, res, onCreate);
}

function onCreate(rec){
    if (rec.pass !== undefined && rec.pass.length > 0){
        rec.pass = secret.encrypt(rec.pass);
    }
}

exports.delete = function(req, res){
    db.deleteData(dbname, colName, req, res);
}




