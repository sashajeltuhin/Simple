var csv = require('csv');
var fs = require('fs');

exports.readCSV = function(fileName, colMap, onRowCallback, completeCallback){
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
                onRowCallback(row, index, colMap);
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

exports.writeCSV = function(fileName, data, cols, completeCallback){
    var d = [];
    for(var i = 0; i < data.length; i++){
        var obj = data[i];
        if (i == 0){
            var header = [];
            for(var key in cols){
                if (cols[key] !== '_id'){
                    header.push(cols[key]);
                }

            }
            d.push(header);
        }
        var row = [];
        for (var c = 0 ; c < cols.length; c++){
            var col = cols[c];
            if (col !== '_id'){
                var val = obj[col]
                if (Array.isArray(val)){
                    val = val.join(" ");
                }
                else if (val == undefined){
                  val = "";
                }
                row.push(val);
            }
        }
        d.push(row);
    }

    csv().from(d).to.path(__dirname + fileName).on('close', function(count){
        console.log(count);
        if (completeCallback !== undefined){
            completeCallback(null, count);
        }
    }).on('error', function(error){
        console.log(error.message);
        if (completeCallback !== undefined){
            completeCallback(error, null);
        }
    });
}

exports.readColumns = function(fileName, onRowCallback, completeCallback){
    var stream = fs.createReadStream(__dirname + fileName);
    stream.on('error', function (error) {
        if (completeCallback !== undefined){
            completeCallback(error, null);
        }
    });
    csv().from.stream(stream, {
            columns: false
        })
        //.to.path(__dirname+'/sample.out')
//        .transform( function(row){
//            //row.unshift(row.pop());
//            return row;
//        })
        .on('record', function(row,index){
            console.log('#'+index+' '+JSON.stringify(row));
            if (completeCallback !== undefined){
                completeCallback(null, row);
            }
            csv().end();
        })
        .on('error', function(error){
            console.log(error.message);
            if (completeCallback !== undefined){
                completeCallback(error, null);
            }
        });
}