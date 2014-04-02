var db = require('../db/dbaccess');
var mongo = require('mongodb');
var rule = require('./rule');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'survey';



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

exports.target = function (req, res){
    db.setDB('ShopDB');
    var customer = req.body.customer;
    var filter = {};
    filter.order_by = {priority:1};
    filter.active = true;
    var step = req.body.step;
    if (step !== undefined){
        filter.app = step.app;
    }else{
       filter.app = customer.app;
    }

    rule.loadRules(req, function(err, list){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            var hit = false;
            for (var i = 0; i < list.length;i++){
                var seg = list[i];

                if(hit == false && seg.active == true && rule.fitsSegment(customer, seg)){
                    rule.buildFilter(filter, seg);
                    hit = true;
                }
            }

            filter = db.getFilter(filter);
            db.load(colName, filter, function(err, recs){
                if (err !== null){
                    handleError(res, "Cannot list questions ", err);
                }
                else{
                    res.send(recs);
                }
            });
        }
    });
}

exports.save = function(req, res){
    db.saveData(dbname, colName, req, res);

}

exports.delete = function(req, res){
    db.deleteData(dbname, colName, req, res);
}

