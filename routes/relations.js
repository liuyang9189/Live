var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');


/*//访客页面--关注、取消用户
exports.visirelation = function (req, res) {
    console.log("进这里")
    var user=req.session["user"];
    var visitorName= req.param("visitorName");
    var visitorId= req.param("visitorId");
    dbpool.execute(function(db){
        db.collection("relations",function(err,coll){
            var userRelations={
                "user_id" : user._id,     //当前用户ID
                "relate_id" : visitorId,  //关注用户ID
                "user_name" : user.nickname,  //当前用户ID
                "relate_name" : visitorName,  //关注用户ID
                "isfans":false           //是否互相关注
            }
            db.collection("relations",function(err,coll){
                coll.findOne({user_id:visitorId,relate_id:user._id},function(err,vr){
                    console.log(JSON.stringify(vr).toString());
                    if(vr!=null){
                        userRelations.isfans=true;
                        coll.update({relate_id:user._id,user_id:visitorId},{$set:{isfans:true}});
                    }
                    coll.insert([userRelations]);
                })
            })
        });
    });
};*/

//校验用户关系
exports.checkrelation = function(req, res){
    dbpool.execute(function(db){
        var user=req.session["user"];
        var visitorId= req.param("visitorId");
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){

            res.send("var checkrelation="+JSON.stringify(results));
        });

        if(user){
            console.log(new ObjectID(user._id)+"用户ID")

            db.collection("relations",function(err,coll){
                //已关注
                coll.findOne({user_id:user._id,relate_id:visitorId},wrap.wrap(function(err,yiguanzhu){
                    console.log("yiguanzhu" + yiguanzhu )
                    if(yiguanzhu!=null){return "true";}else{return "false";}
                },"ygz"));

                //被关注
                coll.findOne({user_id:visitorId,relate_id:user._id},wrap.wrap(function(err,beiguanzhu){
                    console.log("beiguanzhu" + beiguanzhu + "!!"+visitorId+"!!"+user._id)
                    if(beiguanzhu!=null){return "true";}else{return "false";}
                },"bgz"));

            });
           /*
            db.collection("relations",function(err,coll){

            });*/
        }
    });
};

//更新用户关系
exports.updaterelation = function (req, res) {
    dbpool.execute(function(db){
        var user=req.session["user"];
        if(user){
            var visitorId= req.param("visitorId");
            var visitorName= req.param("visitorName");
            var visitorFace= req.param("visitorFace");
            var visitorType=req.param("gz_type");
            var userRelations={
                "user_id" : user._id,           //当前用户ID
                "relate_id" : visitorId,        //关注用户ID
                "user_name" : user.nickname,   //当前用户昵称
                "relate_name" : visitorName,    //关注用户昵称
                "user_face" : user.face,        //当前用户头像
                "relate_face" :visitorFace,     //关注用户头像
                "isfans":false                  //是否互相关注
            }

            //消息任务发送***********************//
            var msgSend={
                "user_id":user._id,               //用户ID
                "user_nickname":user.nickname,  //用户昵称
                "user_face":user.face,           //用户昵称
                "time":new Date(),                //消息时间
                "type":1,                         //消息类型1 被关注
                "pin":user.pin,                   //用户PIN
                "content":"关注了你",            //消息内容.
                "url":"list/"+user.pin+"/all/1" //消息URL
            }
            db.collection("message_send_task_zbt",function(err,coll){
                coll.insert(msgSend);
            });
            //消息任务发送***********************//

            db.collection("relations",function(err,coll){
                console.log("访客姓名："+visitorName +"访客ID："+visitorId +"关注类型："+visitorType);
                //更新当前用户关系数量
                function userRelationNum(n){
                    db.collection("user",function(err,doc){
                        doc.findOne({_id:new ObjectID(user._id)},function(err,urn){
                            console.log("更新USER表的关注数量")
                            doc.update({_id:new ObjectID(user._id)},{ $set:{attention_num:urn.attention_num+n}});
                        });
                    });
                }


                //加关注
                if(visitorType=="jgz"){
                    coll.insert([userRelations]);
                    userRelationNum(1);
                }
                //取消已关注
                if(visitorType=="qx_ygz"){
                    coll.remove({user_id:user._id,relate_id:visitorId});
                    userRelationNum(-1)
                }
                //关注当前关注我的访客用户
                if(visitorType=="bgz"){
                    userRelations.isfans=true;
                    coll.update({relate_id:user._id,user_id:visitorId},{$set:{isfans:true}});
                    coll.insert([userRelations]);
                    userRelationNum(1);
                }
                //取消互相关注
                if(visitorType=="qx_hgz"){
                    coll.remove({user_id:user._id,relate_id:visitorId});
                    coll.update({relate_id:user._id,user_id:visitorId},{$set:{isfans:false}});
                    userRelationNum(-1)
                }
            })
        }
    });
};





//个人消息中心
exports.message = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            res.render('message',results);
            console.log(JSON.stringify(results).toString())
            //res.send("var data="+JSON.stringify(results));
        });
        //获取消息表中的当前用户相关消息
        db.collection("message",function(err,coll){
            if(!err && user){
                coll.find({user_id:user._id}).sort([['form_time_normal',-1]]).toArray(wrap.wrap(function(err,msg){
                    for(var i=0;i<msg.length;i++){
                        var message = msg[i].message;
                        var form_name = msg[i].form_name;
                        (function(n){
                            db.collection("direct",function(err,coll){
                                coll.find({creator:form_name,title:message}).toArray(wrap.wrap(function(err,msgs){
                                    var direct_id = [];
                                    for(var y=0;y<msgs.length;y++){
                                        direct_id[direct_id.length] = msgs[y]._id
                                    }
                                    msg[n].direct_id = direct_id;
                                },"directs"));
                            });
                        })(i)
                    }
                    return msg;
                },"msg"));
            }
        });
    });
}





//邀请用户
exports.invite = function(req, res){
    var user = req.session["user"];
    var oDid = req.param("did","");
    console.log("ddddddddddddd"+oDid)
    var oInvite = req.param("invite","");
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            //results.user = user;
            res.send("var inviteusers="+JSON.stringify(results));
        });
        //获取消息表中的当前用户相关消息
        db.collection("user",function(err,coll){
            coll.findOne({nickname:oInvite},function(err,user_invite){
                db.collection("assist",function(err,docs){
                    console.log("user_invite"+user_invite)
                        if(user_invite){

                            var Assist={
                                "user_id":new ObjectID(user._id),  //用户ID
                                "user_nickname":user.nickname,     //用户昵称
                                "user_face":user.face,              //用户头像
                                "invite_id":user_invite._id,        //受邀请用户ID
                                "invite_name":user_invite.nickname,//受邀请用户昵称
                                "invite_face":user_invite.face,     //受邀请用户头像
                                "invite_time":new Date(),           //受邀请用户时间
                                "direct_id":new ObjectID(oDid)                     //用户直播ID
                            }
                            docs.insert(Assist,function(){
                                docs.find({user_id:new ObjectID(user._id)}).sort([['invite_time',-1]]).toArray(wrap.wrap(function(err,invitelist){
                                    return invitelist;
                                },"invitelist"));
                            });
                        }
                        else{
                            res.send("err!");//请确认已邀请过，或者没有此用户！
                        }
                });
            });
        });
    });
}

//删除当前直播受邀请用户
exports.del_invite = function(req, res){
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oDid = req.param("did","");
        var oDeluser = req.param("invite","");
        db.collection("assist", function (err, conn) {
            conn.findAndRemove({direct_id:new ObjectID(oDid),invite_name:oDeluser},function(err,doc){
                res.send("var inviteusers="+JSON.stringify(doc));
                console.log("var inviteusers="+JSON.stringify(doc))
            });
        });
    });
}

//邀请用户（初始化）
exports.init_invite = function(req, res){
    dbpool.execute(function(db){
        var user = req.session["user"];
        var oDid = req.param("did","");
        var oCreator = req.param("creator","");
        //获取消息表中的当前用户相关消息
        db.collection("assist", function (err, conn) {
            conn.find({direct_id:new ObjectID(oDid),user_id:new ObjectID(oCreator)}).toArray(function(err, invites) {
                res.send("var init_invites="+JSON.stringify(invites));
            });
        });
    });
}
