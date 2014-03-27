var nodemailer = require("nodemailer");
var smtp = require('./smtpserver');
var secret = require('./mkcrypt');

exports.sendMail = function(tenant, subject, from, to, msg, callback){
    sendMail(tenant, subject, from, to, msg, false, callback);
}

exports.sendSMS = function(tenant, subject, from, to, msg, callback){
    sendMail(tenant, subject, from, to, msg, true, callback);
}

function sendMail(tenant, subject, from, to, msg, sms, callback){
    var f = {};
    f.active = true;
    f.tenant = tenant;
    smtp.loadConfig(f, function(err, data){
        if (err !== null){
            callback(err, null);
        }
        else if (data.length > 0 ){
            var opt = {};
            var smtpConfig = data[0];
            if(smtpConfig.service !== undefined && smtpConfig.service.length > 0 ){
                opt.service = smtpConfig.service;
            }

            if(smtpConfig.host !== undefined && smtpConfig.host.length > 0 ){
                opt.host = smtpConfig.host;
            }

            if(smtpConfig.port !== undefined && smtpConfig.port.length > 0 ){
                opt.port = smtpConfig.port;
            }

            if(smtpConfig.user !== undefined && smtpConfig.user.length > 0 ){
                opt.auth = {};
                opt.auth.user = smtpConfig.user;
                opt.auth.pass = secret.decrypt(smtpConfig.pass);
            }
            opt.secureConnection = smtpConfig.secureConnection;

            var smtpTransport = nodemailer.createTransport("SMTP", opt);

            var mailOptions = {
                from: from, //"Dork Foo ✔ <foo@blurdybloop.com>", // sender address
                to: to, //"bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
                subject: subject //"Hello ✔", // Subject line
            }

            if (sms == true){
                mailOptions.text = msg;
            }
            else{
                mailOptions.html = msg;
            }


            smtpTransport.sendMail(mailOptions, function(error, response){
                smtpTransport.close(); // shut down the connection pool, no more messages
                if(error){
                    callback(error, null);
                }else{
                    callback(null, response.message);
                }


            });
        }

    });
}

//
//var smtpTransport = nodemailer.createTransport("SMTP",{
//    service: "Gmail",
//    auth: {
//        user: "user@gmail.com",
//        pass: "pass"
//    }
//});

//or
//    host: "smtp.gmail.com", // hostname
//        secureConnection: true, // use SSL
//        port: 465, // port for secure SMTP
//        auth: {
//        user: "gmail.user@gmail.com",
//            pass: "userpass"
//    }

//AT&T: number@txt.att.net
//T-Mobile: number@tmomail.net
//Verizon: number@vtext.com
//Sprint: number@messaging.sprintpcs.com or number@pm.sprint.com
//Virgin Mobile: number@vmobl.com
//Tracfone: number@mmst5.tracfone.com
//Metro PCS: number@mymetropcs.com
//Boost Mobile: number@myboostmobile.com
//Cricket: number@sms.mycricket.com
//Nextel: number@messaging.nextel.com
//Alltel: number@message.alltel.com
//Ptel: number@ptel.com
//Suncom: number@tms.suncom.com
//Qwest: number@qwestmp.com
//U.S. Cellular: number@email.uscc.net