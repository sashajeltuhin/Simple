var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'ccnumber';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list ccnumbers ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.save = function(req, res){
    db.saveData(dbname, colName, req, res);
}


exports.delete = function(req, res){
    db.deleteData(dbname, colName, req, res);
}







