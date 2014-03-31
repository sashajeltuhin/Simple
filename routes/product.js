/**
 * Created with JetBrains WebStorm.
 * User: sashajeltuhin
 * Date: 3/20/13
 * Time: 12:14 AM
 * To change this template use File | Settings | File Templates.
 */
var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var rule = require('./rule');
var csvtool = require('./csvtool');
var winston = require('winston');
var dbname = 'ShopDB';

var colName = 'product';

winston.add(winston.transports.File, { filename: 'mkapplog.log' });
winston.remove(winston.transports.Console);

var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}


exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            res.send(recs);
        }
    });
}

function addGlobalConditions(seg, filter){
    if (seg.limit !== undefined && Number(seg.limit) > 0){
        filter.limit = seg.limit;
    }
}

exports.qual = function (req, res){
    winston.log('info', 'Qual call body: %', req.body);
    db.setDB('ShopDB');
    var customer = req.body.customer;
    var filter = {};
    filter.order_by = {priority:1};

    rule.loadRules(req, function(err, list){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            var hit = false;
            for (var i = 0; i < list.length;i++){
                var seg = list[i];
                if (seg.active && seg.global){
                    addGlobalConditions(seg, filter);
                }
                if(hit == false && seg.active == true && rule.fitsSegment(customer, seg)){
                    rule.buildFilter(filter, seg);
                    hit = true;
                }
            }
            if (customer.zip !== undefined && customer.zip !== ""){
                filter.zip = customer.zip;
            }
            filter = db.getFilter(filter);
            db.load(colName, filter, function(err, recs){
                if (err !== null){
                    handleError(res, "Cannot list products ", err);
                }
                else{
                    res.send(recs);
                }
            });
        }
    });
}

exports.delete = function(req, res){
    db.deleteData(dbname, colName, req, res);
}

exports.save = function(req, res){
    db.saveData(dbname, colName, req, res);
}


exports.total = function(req, res){
    var filter = req.query;
    db.count(colName, filter, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot count products ", err);
        }
        else{
            res.send({tot: rec});
        }
    });
}

exports.import = function(req, res){
    var fn = req.body.fn;
    var colMap = req.body.map
    csvtool.readCSV('/../tmp/files/' + fn, colMap, importRow, function(error, count){
        if (error == null){
            res.send({success:true, recs: count});
        }
        else{
            console.log(error);
            res.send({success:false, err: error});
        }
    });

}

exports.detectCols = function(req, res){
    var fn = req.body.fn;
    csvtool.readColumns('/../tmp/files/' + fn, null, function(error, row){
        if (error == null){
            res.send({success:true, map: row});
        }
        else{
            console.log(error);
            res.send({success:false, err: error});
        }
    });

}

function importRow(row, index, colMap){
    var product = {};
    console.log("product defaults", colMap.defs);
    if (colMap.defs !== undefined){
        for(var dk in colMap.defs){
            product[dk] = colMap.defs[dk];
        }
    }

    var i = 0;
    for(var key in row){
        var mapObj = colMap.map[i];
        product[mapObj.field] = row[key];
        i++;
    }

    if (product.title !== undefined && product.title.length !== 0 && product.title !== ""){
        console.log("product imported", product);
        db.insert(colName, product, function(err, rec){
            console.log("with errors:", err);
        });
    }
}

exports.export = function(req, res){

}