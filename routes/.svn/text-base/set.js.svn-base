var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';


exports.set = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            if(user){
                res.render("set",results);
            }
        });
        //用户信息
        db.collection('user', function (err, coll) {
            if(user){
                coll.findOne({_id:new ObjectID(user._id)},wrap.wrap(function(err,dt){
                    return dt;
                },"thisuser"));
            }else{
                res.render("err",{"user":user});
            }
        });
    });
};

//修改用户昵称
exports.setnickname = function (req, res) {
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oNickname=req.param("nickname","");

        db.collection('user', function (err, conn) {
            conn.update({_id:new ObjectID(user._id)},{ $set:{nickname:oNickname}});
            session(new ObjectID(user._id),conn,req,res);
        });
    });
};
//修改用户性别
exports.setsex = function (req, res) {
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oSex=req.param("sex","");
        db.collection('user', function (err, conn) {
            conn.update({_id:new ObjectID(user._id)},{ $set:{sex:oSex}});
            session(new ObjectID(user._id),conn,req,res);
        });
    });
};
//修改用户密码
exports.setpassword = function (req, res) {
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oPassword=req.param("password","");
        var hash = require('crypto').createHash('md5');
        var md5code =  hash.update(oPassword).digest('hex');
        db.collection('user', function (err, conn) {
            conn.update({_id:new ObjectID(user._id)},{ $set:{password:md5code}});
            session(new ObjectID(user._id),conn,req,res);
        });
    });
};
//修改用户头像
exports.setface = function (req, res) {
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oFace=req.param("face","");
        db.collection('user', function (err, conn) {
            conn.update({_id:new ObjectID(user._id)},{ $set:{face:oFace}});
            session(new ObjectID(user._id),conn,req,res);
        });
    });
};

/*修改个人资料后修改session*/
function session(id,data,req,res){
    data.findOne({_id:id},function(err,usermsg){
        req.session["user"] = usermsg;
        res.send("var data=true");
    })
}