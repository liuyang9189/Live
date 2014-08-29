var mongodb = require('mongodb');
var Db = mongodb.Db;
var Server = mongodb.Server;

/*var config = { dbhost : '219.239.88.249',
                dbport : 27017,
                dbname : 'testdb',
                username:'fortest',
                password:'yesky'};*/

var config = { dbhost : 'localhost',
                dbport : 27017,
                dbname : 'livetext',
                username:'',
                password:''};

var MongoDBPool = exports.MongoDBPool = function(cfg,callback){
    if (! cfg) {
        cfg = config;
    }

    var server = new Server(cfg.dbhost, cfg.dbport, {auto_reconnect:false,poolSize:20,socketOptions:{noDelay:true}});
    this.db = new mongodb.Db(cfg.dbname, server,{w:0});
    this.db.open(function(err, db){
         console.log("database is init."  + JSON.stringify(config));
         if (callback) {
             callback();
         }
    });
    /*db.authenticate(config.username, config.password, function(err,result){
        if (err){
            console.log("用户名或密码错！");
        }else{
            console.log("result:" + result);
        }
    });*/
};
MongoDBPool.prototype.execute = function(callback){
    callback(this.db);
};

MongoDBPool.prototype.close = function(callback){
    this.db.close(true, callback);
};

/*

var pool = new MongoDBPool();
setTimeout(function(){
    pool.execute(function(db){
        db.collection('timeline').find().toArray(function (err, items) {
            console.log( items.length);
        });
    });
},1000);*/
