/*var config = { dbhost : '219.239.88.104',
    dbport : 8888,
    dbname : 'testdb',
    username:'fortest',
    password:'yesky'};*/
var config = { dbhost : '219.239.88.104',
    dbport : 8888,
    dbname : 'imagenotes',
    username:'fortest',
    password:'yesky'};

exports.getDB = function(cfg){
    if (! cfg) {
        cfg = config;
    }
    var mongo = require('mongodb');
    var Server = mongo.Server;

    var server = new Server(cfg.dbhost, cfg.dbport, {auto_reconnect:true});
    return new mongo.Db(cfg.dbname, server,{safe:false});
};