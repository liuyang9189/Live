
/*
 * GET users listing.
 */
var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';

exports.list = function(req, res){
  res.send("respond with a resource");
};


//用户登录
exports.login = function (req, res) {
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
            coll.findOne({email:req.param("email","")},function(err,editor){
                if (err || editor == null) {
                    console.log("user not found!");
                    res.send("user not found!");
                    return;
                }
                var inputPassword = req.param("password","");
                var hash = require('crypto').createHash('md5');
                var md5code =  hash.update(inputPassword).digest('hex');

                if (editor.password == md5code){
                    console.log("user :" + editor.email + " is loggin .");
                    req.session["user"] = editor;
                    res.redirect("/");
                    //res.send("登录成功");
                }else {
                    res.send("password error!");
                }
            })
        });
    });
};
//用户注册
exports.register = function (req, res) {
    dbpool.execute(function(db){
        var sPassword = req.param("password");
        var hasher=require('crypto').createHash("md5");
        hasher.update(sPassword);
        var oMd5Password=hasher.digest('hex');
        var userMsg={
            "nickname" : req.param("nickname"), //昵称
            "password" : oMd5Password, //密码
            "email": req.param("email"),         //email
            "face" : req.param("face"),          //头像
            "sex" :req.param("sex"),             //1为男 2为女
            "sina_id":0,                         //新浪ID
            "note_num":0,                        //直播数
            "fans_num":0,                        //粉丝数
            "attention_num":0,  //关注数
            "favorite_num":0,                   //收藏数
            "reg_time":new Date(),              //注册时间
            "login_time":"",                     //最后登录时间
            "pin": req.param("pin"),             //用户pin
            praise:0, //被赞数
            admin:false, //管理员
            white:false  //白名单
        }
        db.collection("user",function(err,coll){
            coll.findOne({nickname:userMsg.nickname},function(err,docs){
                //console.log("face::::::"+userMsg.face)
                console.log(docs);
                var datas={};
                if(docs){
                    datas.a=true;
                    res.redirect("/");
                    //res.send("var user="+JSON.stringify(datas));
                }else{
                    coll.insert(userMsg);
                    userMsg.a=false;
                    //res.send("var user="+JSON.stringify(userMsg));
                    coll.findOne({email:req.param("email","")},function(err,usermsg){
                        if (err || usermsg == null) {
                            res.send("user not found!");
                        }else{
                            var inputPassword = req.param("password","");
                            var hash = require('crypto').createHash('md5');
                            var md5code =  hash.update(inputPassword).digest('hex');
                            if (usermsg.password == md5code){
                                console.log("user :" + usermsg.email + "登陆成功!");
                                req.session["user"] = usermsg;
                                res.send(usermsg);
                                res.redirect("/");
                            }else {
                                res.send("password error!");
                            }
                        }
                    });
                }
            });
        })
    });
};
//用户注册验证
exports.verification = function(req, res){
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
            coll.findOne({email:req.param("email","")},function(err,user){
                if(user){
                    res.send("var aaa=true");//输出到前台
                }else{
                    res.send("var aaa=false");//输出到前台
                }
            });
        });
    });
};

//用户退出登录
exports.logout = function (req, res){
    req.session["user"] = null;
    res.redirect("/");
};

//超级管理员编辑页
exports.superadmin = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            if(user && user.admin == true ){
                res.render("admin",results);
            }else{
                res.render("err",{user:user});
            }
        });
        db.collection("hotpics",function(err,coll){
            coll.find({}).sort({create_time:-1}).toArray(wrap.wrap(function(err,htmls){
                for(var i=0;i<1;i++){
                    return htmls[i];
                }
            },"htmls"));
        });
    });
};
//超级管理员编辑页--html编辑发布
exports.superrelease = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var oHtml={"html" : req.param("html"),"create_time" : new Date(),"create_nickname" : user.nickname}
        db.collection("hotpics",function(err,coll){
            coll.insert(oHtml);
            res.redirect("/superadmin.do");
        });
    });
};

//超级管理员编辑页--remove user
exports.superremoveuser = function(req, res){
    var user = req.session["user"];
    var oId = req.param("_id");
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
            coll.findOne({_id:new ObjectID(oId)},function(err,user){
                coll.findAndRemove({_id:new ObjectID(oId)},function(err,doc){
                    //res.redirect("/superadmin.do");
                    db.collection("direct",function(err,conn){
                        conn.findAndRemove({pin:user.pin},function(err,doc){
                            //res.redirect("/superadmin.do");
                            db.collection("timeline",function(err,comm){
                                comm.findAndRemove({create_id:user._id},function(err,doc){
                                    res.redirect("/superadmin.do");
                                });
                            });
                        });
                    });
                });
            });
            //res.redirect("/superadmin.do");
        });
    });
};
//超级管理员编辑页--remove direct
exports.superremovedirect = function(req, res){
    var user = req.session["user"];
    var oId = req.param("_id");
    dbpool.execute(function(db){
        db.collection("direct",function(err,coll){
            coll.findOne({_id:new ObjectID(oId)},function(err,user){
                coll.findAndRemove({_id:new ObjectID(oId)},function(err,doc){
                    res.redirect("/superadmin.do");
                });
            });
        });
    });
};

//用户权限管理页
exports.useradmin = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            if(user && user.admin == true ){
                res.render("useradmin",results);
            }else{
                res.render("err",{user:user});
            }
        });
        db.collection("hotpics",function(err,coll){
            coll.find({}).sort({create_time:-1}).toArray(wrap.wrap(function(err,htmls){
                for(var i=0;i<1;i++){
                    return htmls[i];
                }
            },"htmls"));
        });
    });
};
//白名单更改
exports.white = function(req, res){
    var user = req.session["user"];
    var oId = req.param("_id");
    var oState = req.param("white");
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
            if(oState == "false"){
                coll.update({_id:new ObjectID(oId)},{ $set:{white:true}});
                res.redirect("/useradmin.do");
                //res.send("var aaa=true");//输出到前台
            }else{
                coll.update({_id:new ObjectID(oId)},{ $set:{white:false}});
                res.redirect("/useradmin.do");
                //res.send("var aaa=false");//输出到前台
            }
        });
    });
};

//管理员授权修改
exports.adminaccredit = function(req, res){
    var user = req.session["user"];
    var oId = req.param("_id");
    var oState = req.param("admin");
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
            if(oState == "false"){
                coll.update({_id:new ObjectID(oId)},{ $set:{admin:true}});
                res.redirect("/useradmin.do");
                //res.send("var aaa=true");//输出到前台
            }else{
                coll.update({_id:new ObjectID(oId)},{ $set:{admin:false}});
                res.redirect("/useradmin.do");
                //res.send("var aaa=false");//输出到前台
            }
        });
    });
};
/*coll.find().toArray(function(err,editor){
    for(var i =0 ;i < editor.length;i++){
        coll.update({praise:{$exists:false}},{$set:{praise:0}},{multi:true});
        console.log(i+"处理完成")
    }
}) ;*/






exports.admin = function(req, res){
    var user = req.session["user"];
    res.render("login",{user:user});
};
exports.zc = function(req, res){
    var user = req.session["user"];
    res.render("register",{user:user});
};