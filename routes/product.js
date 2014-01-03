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
var csvtool = require('./csvtool');

var colName = 'product';



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

exports.qual = function (req, res){
    db.setDB('ShopDB');
    var customer = req.body;
    var filter = {};
    filter.order_by = {priority:1};

    db.load('segment', db.getFilter({app:customer.app}), function(err, list){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            for (var i = 0; i < list.length;i++){
                var seg = list[i];
                if(seg.active == true && fitsSegment(customer, seg)){
                    if (seg.prodcat !== undefined && seg.prodcat!== ""){
                        filter.cat = seg.prodcat;
                    }
                    if (seg.limit !== undefined && Number(seg.limit) > 0){
                        filter.limit = seg.limit;
                    }
                    if (customer.lastStep == 'offer' && seg.offersize !== undefined && Number(seg.offersize) > 0){
                        filter.limit = seg.offersize;
                    }
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

function fitsSegment(customer, seg){
    var fits = false;

    if(customer[seg.field] !== undefined){
        var arr = seg.val.split(',');
        switch(seg.oper){
            case "=":
                fits = customer[seg.field] == arr[0];
                break;
            case ">":
                fits = customer[seg.field] > arr[0];
                break;
            case "<":
                fits = customer[seg.field] < arr[0];
                break;
            case "between":
                fits = customer[seg.field] > arr[0] && customer[seg.field] < arr[1];
                break;
        }
    }
    else{ //global
        fits = true;
    }
    return fits;
}


exports.default = function (req, res){
    db.setDB('ShopDB');
    var that = this;
    var filter = req.query;
    if (filter == null){
        filter = {};
    }
    filter.default = true;
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list products ", err);
        }
        else{
            var dp;
            if (recs == null || recs.length < 1){
                dp =  {
                    provider:'AT&T',
                    prodID: 'UV1234',
                    default:true,
                    featured:false,
                    cat:'Internet',
                    title: 'Att Uverse',
                    desc:'Super fast',
                    prodimgUrl: 'prod.jpg',
                    brandimgUrl: 'brand.jpg',
                    prodimgDesc:'',
                    brandimgDesc:'',
                    highlights: ['10 meg', 'Gaming', 'Fast'],
                    features: ['Best in class'],
                    terms : 'Standard',
                    termsUrl : '',
                    priceOrig : 499.99,
                    priceNow : 399.99,
                    priceCallout: 'Act now',
                    promoText: 'Act quickly',
                    buyText : 'Add'
                };
                prodUpsert(dp, {}, function(){});
            }
            else{
                dp = recs[0];
            }

            res.send(dp);

        }
    });
}

exports.delete = function(req, res){
    db.setDB('ShopDB');
    var pids = req.param("_id");
    var pid = new ObjectID(pids);
    var filter = {_id : pid};
    db.delete(colName, filter, function(err, ret){
        if (err !== null){
            handleError(res, "Cannot delete product ", err);
        }
        else{
            res.send(pid);
        }
    });
}

exports.upsert = function(req, res){
    db.setDB('ShopDB');
    var v = req.body;
    var vid = v.obj;
    var filter = v.filter;

    if (vid == undefined){
        vid = v;
    }
    if (filter !== undefined){
        filter = db.getFilter(filter).query;
    }

    if (filter !== undefined || (vid._id !== null && vid._id != undefined)){
        if (filter == undefined){
            filter = {};
            filter._id = new ObjectID(vid._id);
            vid._id = filter._id;
        }

    prodUpsert( vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add products ", err);
        }
        else{
            vid._id = newid;
            res.send(vid);
        }
    });
    }
    else{
        db.insert(colName, vid, function(err, rec){
            if (err !== null){
                handleError(res, "Cannot add products ", err);
            }
            else{
                res.send(rec);
            }
        });
    }

}

var prodUpsert = function(vid, filter, callback){
    db.upsert(colName, vid, filter, callback);
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
    for(var key in row){
        var mapObj = colMap[index];
        product[mapObj.field] = row[key];
    }
    console.log("product imported", product);
}

exports.export = function(req, res){

}