var csv = require('csv');
var fs = require('fs');

exports.readCSV = function(fileName, onRowCallback, completeCallback){
    var stream = fs.createReadStream(__dirname + fileName);
    stream.on('error', function (error) {
        if (completeCallback !== null){
            completeCallback(error, null);
        }
    });
    csv()
        .from.stream(stream, {
            columns: true
        })
        //.to.path(__dirname+'/sample.out')
//        .transform( function(row){
//            //row.unshift(row.pop());
//            return row;
//        })
        .on('record', function(row,index){
            console.log('#'+index+' '+JSON.stringify(row));
            if (onRowCallback !== undefined){
                onRowCallback(row, index);
            }
        })
        .on('end', function(count){
            console.log('Number of lines: '+count);
            if (completeCallback !== null){
                completeCallback(null, count);
            }
        })
        .on('error', function(error){
            console.log(error.message);
            if (completeCallback !== null){
                completeCallback(error, null);
            }
        });
}