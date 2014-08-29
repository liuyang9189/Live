var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';
var ListUtil = require("../utils/ListUtil.js");





exports.mylive = function(req, res){
    var liveuserid = [];
    var user = req.session["user"];
    var oSkip=req.param("skip","0");
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            if(user){
                results.userid = user._id;
                results.liveuserid = liveuserid;
            }
            if(req.param("type") == 'json'){
                res.send("var data="+JSON.stringify(results));
            }else{
                res.render("mylive",results);
            }
        });
        //直播信息
        db.collection("direct",function(err,coll){
            coll.findOne({_id:new ObjectID(req.param("directid",""))},wrap.wrap(function(err,direct){
                db.collection('user', function (err, conn) {
                    conn.findOne({nickname:direct.creator},wrap.wrap(function(err,dt){
                        if(!err){
                            direct.note_num = dt.note_num;
                            direct.face = dt.face;
                            liveuserid = dt._id;
                            direct.creator_id = dt._id;
                            direct.creator_name = dt.nickname;
                            direct.creator_face = dt.face;
                        }
                    }));
                });
                return direct;
            },"thisdirect"));
        });
        //置顶链接
        db.collection("recommend",function(err,coll){
            coll.find({direct_id:new ObjectID(req.param("directid",""))}).toArray(wrap.wrap(function(err,recommends){
                return recommends;
            },"thisrecommend"));
        });
        //直播内容
        db.collection("timeline",function(err,coll){
            var livetime  = req.param("ct");
            if (typeof(livetime)=="undefined" || livetime == null ) {
                coll.find({direct_id:new ObjectID(req.param("directid","")),type:1},{skip:oSkip, limit:10}).sort([["create_time",-1]]).toArray(wrap.wrap(function(err,directs){
                    ListUtil.addOrUpdateField(directs,'create_time',function(direct){
                        direct["shortTime"] = exdate.format(direct.create_time,'HH:mm');
                        direct["time1"]=exdate.format(direct.create_time,'yyyy-MM-dd');
                        return exdate.format(direct.create_time,'yyyy-MM-dd HH:mm:ss');
                    });
                    return directs;
                },"release"));
            }else {
                var createdTime = exdate.stringToDate(livetime, 'yyyy-MM-dd HH:mm:ss');
                coll.find({direct_id:new ObjectID(req.param("directid","")),type:1,create_time:{$gt:createdTime}},{skip:oSkip, limit:10}).sort([["create_time",-1]]).toArray(wrap.wrap(function(err,directs){
                    ListUtil.addOrUpdateField(directs,'create_time',function(direct){
                        direct["shortTime"] = exdate.format(direct.create_time,'HH:mm');
                        direct["time1"]=exdate.format(direct.create_time,'yyyy-MM-dd');
                        if(directs.length != 0){
                            direct["newlive"]="true";
                        }
                        return exdate.format(direct.create_time,'yyyy-MM-dd HH:mm:ss');
                    });
                    return directs;
                },"release"));
            }
        });
    });
};
//赞
exports.praise = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var user = req.session["user"];
        db.collection('direct', function (err, conn) {
            conn.findOne({_id:directid},function(err,directs){
                if(directs.praise){
                    conn.update({_id:directid},{ $set:{praise:directs.praise+1}},function(){
                        db.collection('user', function (err, conn) {
                            conn.findOne({_id:new ObjectID(user._id)},function(err,direct){
                                conn.update({_id:new ObjectID(user._id)},{ $set:{praise:direct.praise+1}});
                            })
                        });
                    });
                    res.send("var user=true");
                }else{
                    conn.update({_id:directid},{ $set:{praise:1}},function(){
                        db.collection('user', function (err, conn) {
                            conn.findOne({_id:new ObjectID(user._id)},function(err,direct){
                                conn.update({_id:new ObjectID(user._id)},{ $set:{praise:direct.praise+1}});
                            })
                        });
                    });
                    res.send("var user=true");
                }
            })
        });
    });
};
