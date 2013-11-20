var http = require("http");

exports.requestInfo = function(ip, callback)
{

//    //check ip
//    $.get('http://xml.utrace.de/?query=' + service.customer.IP, function( data ){
//        var $xmlDoc = $.parseXML(data);
//        $xml = $( xmlDoc )
//        var isp = $xml.find('isp');
//        var org = $xml.find('org');
//        console.log('isp = ' + isp + ' org = ' + org);
//    });

    var options = {
        host: 'http://xml.utrace.de',
        path: '/?query=' + ip,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };


    var req = http.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            console.log(output);
            var info = {};
            var ispInd = output.indexOf('<isp>');
            var endisp = output.indexOf('</isp>');
            info.isp = output.substring(ispInd + 5, endisp);

            var orgInd = output.indexOf('<org>');
            var endOrg = output.indexOf('</org>');
            info.org = output.substring(orgInd + 5, endOrg);

            callback(res.statusCode, info);
        });
    });

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
};
