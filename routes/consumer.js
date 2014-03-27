var db = require('../db/dbaccess');
var mongo = require('mongodb');
var csvtool = require('./csvtool');
var postman = require('./mkmail');
var provider = require('./provider');
var note = require('./note');
var ObjectID = mongo.ObjectID;
var detect = require('./detect');
var dbname = 'ShopDB';

var colName = 'consumer';



var handleError = function(res, msg, err){
    res.send({Error : {text:msg, det:err}});
}

exports.list = function (req, res){
    db.setDB('ShopDB');
    var filter = db.getFilter(req.body);
    console.log("consumer filter: ", filter);
    db.load(colName, filter, function(err, recs){
        if (err !== null){
            handleError(res, "Cannot list consumer ", err);
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
    if (vid._id !== null && vid._id !== undefined){
        filter._id = new ObjectID(vid._id);
        vid._id = filter._id;


    db.upsert(colName, vid, filter, function(err, newid){
        if (err !== null){
            handleError(res, "Cannot add consumer ", err);
        }
        else{
            res.send(vid);
        }
    });
    }
    else{
        createConsumer(vid, res);
//        if (vid.IP !== undefined){
//            detect.requestInfo(vid.IP, function(code, obj){
//                vid.isp = obj.isp;
//                vid.org = obj.org;
//                createConsumer(vid, res);
//            });
//        }
//        else{
//            createConsumer(vid, res);
//        }

    }
}

function createConsumer(cons, res){
    db.insert(colName, cons, function(err, rec){
        if (err !== null){
            handleError(res, "Cannot add consumer ", err);
        }
        else{
            res.send(rec);
        }
    })
}

exports.peopleByType = function(req, res){

    var filter = req.body;
    var  f = [{ $match: {tenant:filter.tenant}}, {$group : {_id: '$type', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

exports.abandons = function(req, res){

    var filter = req.body;
    var fobj = {tenant:filter.tenant};
    if (filter.app !== undefined){
        fobj.app = filter.app;
    }
    var  f = [{ $match: fobj}, {$group : {_id: '$lastStep', result:{$sum : 1} } }];
    compute(f, function(err, result){
        if (err !== null){
            handleError(res, "Cannot add actions ", err);
        }
        else{
            res.send(result);
        }
    });
}

var compute = function(filter, callback){
    db.setDB('ShopDB');
    db.aggregate(colName, filter, function(err, recs){
        if (err !== null){
            callback(err, recs);
        }
        else{
            callback (null, recs);
        }
    });
}

exports.export = function(req, res){
    var filter = db.getFilter(req.body.f);
    var cols = req.body.cols;
    var user = req.user;
    if (user == undefined){
        res.send(400, {"err": msg});
    }else{
        db.load(colName, filter, function(err, recs){
            if (err !== null){
                handleError(res, "Cannot list consumer ", err);
            }
            else{
                res.send({});
                var fname = new ObjectID().toString();
                var fullname = fname + '.csv';
                var sender = {};
                sender.id = 1;
                sender.name = "FUSE";
                csvtool.writeCSV('/../tmp/reports/' + fname + '.csv', recs, cols, function(error, count){
                    if (error == null){
                        note.sendInfo(user, "Export Complete", 'Exported ' + count + ' records. The file is available for download',  '/tmp/reports/' + fullname, sender);
                    }
                    else{
                        console.log(error);
                        note.sendError(user, "Export Failure", 'Export of consumer data failed with the following error ' + error);
                    }
                });
            }
        });
    }
}

exports.verify = function(req, res){
    var customer = req.body.c;

    var msg = req.body.msg;
    var subject = req.body.subject;
    if (customer.mobilevendor !== undefined && customer.mobilevendor.length > 0){
        provider.loadProvider({name:customer.mobilevendor }, function(err, data){
           if (data.length > 0 && data[0].smsgateway !== undefined && data[0].smsgateway.length > 0) {
               var mobileMail = customer.mobil + data[0].smsgateway;
               postman.sendSMS(customer.tenant, subject, 'orders@bridgevine.com', mobileMail, msg, function(err, response){
                   if (err !== null){
                       res.send(500, {"err": err});
                   }
                   else{
                       res.send(response);
                   }
               });
           }
            else{
               emailConsumer(customer.tenant, subject, 'orders@bridgevine.com', customer.email, msg, res);
           }

        });
    }
    else{
        emailConsumer(customer.tenant, subject, 'orders@bridgevine.com', customer.email, msg, res);
    }


}

function emailConsumer(tenant, subject, from, to, msg, res){
    postman.sendMail(tenant, subject, from, to, msg, function(err, response){
        if (err !== null){
            res.send(500, {"err": err});
        }
        else{
            res.send(response);
        }
    });
}





