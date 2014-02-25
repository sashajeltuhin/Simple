var db = require('../db/dbaccess');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var dbname = 'ShopDB';
var mkio =require('./mkfiles');
var step =require('./step');

var colName = 'tmpldraft';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list versions ", err);
        }
        else{
            res.send(recs);
        }
    });
}

exports.publish = function (req, res){
    db.setDB('ShopDB');
    var f = req.body;
    var draft = f.draft;
    var w = f.widget;
    var tname = f.tenant;
    draft.changed = new Date();
    draft.published = true;

    var filter = {};
    if (draft._id !== null){
        filter._id = new ObjectID(draft._id);
        draft._id = filter._id;
    }
    db.upsert(colName, draft, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add versions ", err);
        }
        else{
            var fid = new ObjectID();
            var fn = '/tenants/' + tname + '/' + fid + '.html';
            mkio.saveFile(draft.version, '/..' +  fn, function(err){
                if (err !== null){
                    handleError(res, "Cannot publish template ", err);
                }
                else{
                    w.template = fn;
                    step.update(w, function(err, s){
                        if (err !== null){
                            handleError(res, "Cannot list versions ", err);
                        }
                        else{
                            res.send(s);
                        }
                    });
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
            handleError(res, "Cannot add versions ", err);
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
            handleError(res, "Cannot delete versions ", err);
        }
        else{
            res.send(pid);
        }
    });
}



