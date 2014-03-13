var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';

var colName = 'rule';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list rule ", err);
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
    if (vid._id !== null){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;
    }
    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add rule ", err);
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
            handleError(res, "Cannot delete rule ", err);
        }
        else{
            res.send(pid);
        }
    });
}

exports.fitsSegment = function(customer, seg){
    var fits = false;
    if (seg.dems == undefined && seg.conds == undefined){
        return false;
    }
    else if (seg.dems == undefined && seg.conds !== undefined && seg.conds.length > 0){
        return true;
    }

    for (var i = 0; i < seg.dems.length; i++){
        var f = seg.dems[i];
        if(customer[f.field] !== undefined){
            var arr = getVals(f);
            switch(f.oper){
                case "=":
                case "in":
                    if (Array.isArray(customer[f.field])){
                        for (var v = 0; v < customer[f.field].length; v++){
                            var cval = customer[f.field][v];
                            if (arr.indexOf(cval) > -1){
                                fits = true;
                                break;
                            }
                        }
                    }
                    else{
                        fits = customer[f.field] == arr[0];
                    }
                    break;
                case ">":
                    fits = customer[f.field] > arr[0];
                    break;
                case "<":
                    fits = customer[f.field] < arr[0];
                    break;
                case "between":
                    fits = customer[f.field] > arr[0] && customer[f.field] < arr[1];
                    break;
            }
            if (seg.oper == "any"){
                if (fits == true){
                    break;
                }
            }
        }

    }
    return fits;
}

function getVals(cond){
    var vals = cond.val.split(',');
    var arr = [];
    if (vals !== undefined && cond.fldtype == 'number'){
        for(var i = 0; i < vals.length;i++){
            var v = vals[i];
            arr.push(Number(v));
        }
    }
    else{
        arr = vals;
    }
    return arr;
}

exports.buildProdFilter = function(filter, seg){
    if (seg.conds !== undefined){
        for (var i = 0; i < seg.conds.length; i++){
            var f = seg.conds[i];
            if (f.oper == "="){
                filter[f.field] = f.val;
            }
            else if (f.oper == 'all'){
                var o = {};
                o.oper = f.oper;
                o.val = f.val.split(',');
                filter[f.field] = o;
            }
            else if (f.oper == 'in'){
                var o = {};
                o.oper = f.oper;
                o.val = f.val.split(',');
                filter[f.field] = o;
            }
            else{
                filter[f.field] = f.oper + f.val;
            }
        }
        if (seg.limit !== undefined && Number(seg.limit) > 0){
            filter.limit = seg.limit;
        }
    }
}




