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
    filter.app = customer.app;

    db.load('rule', db.getFilter({app:customer.app, type:'survey', order_by:{order:1}}), function(err, list){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            var hit = false;
            for (var i = 0; i < list.length;i++){
                var seg = list[i];

                if(hit == false && seg.active == true && rule.fitsSegment(customer, seg)){
                    rule.buildProdFilter(filter, seg);
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
    db.setDB(dbname);
    var vid = req.body;
    var filter = {};
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add steps ", err);
        }
        else{
            if (newid !== null){
                vid._id = newid;
            }
            res.send(vid);
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
            handleError(res, "Cannot delete question ", err);
        }
        else{
            res.send(pid);
        }
    });
}

