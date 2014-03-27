var crypto = require('crypto');
var assert = require('assert');

var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'meyekids';


exports.encrypt = function(val){
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(val, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
}

exports.decrypt = function(val){
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(val, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}


