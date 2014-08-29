var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';



//直播后台页
exports.edit = function(req, res){
    var user = req.session["user"];
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            if(user){
                res.render("edit",results);
            }
        });
        //我的直播

        db.collection("direct",function(err,coll){
            coll.findOne({_id:new ObjectID(req.param("directid",""))},wrap.wrap(function(err,direct){
                direct.time=exdate.format(direct.create_time,'yyyy-MM-dd HH:mm');
                var c = direct.type;
                var oType = null;
                switch (c){
                    case "活动直播": oType = "q"; direct.oType = oType; break;
                    case "笔记本/平板": oType = "pc"; direct.oType = oType; break;
                    case "移动互联": oType = "mobile"; direct.oType = oType; break;
                    case "配件/显示器": oType = "cpu"; direct.oType = oType; break;
                    case "IT新闻": oType = "enterprise"; direct.oType = oType; break;
                    case "数码影像": oType = "digital"; direct.oType = oType; break;
                    case "游戏live秀": oType = "gamelive"; direct.oType = oType; break;
                    case "新品秀": oType = "hardware"; direct.oType = oType; break;
                    case "数字家电": oType = "dh"; direct.oType = oType; break;
                    case "外设/深港": oType = "diy"; direct.oType = oType; break;
                }
                return direct;
            },"thisdirect"));
        });
        //我的直播内容
        db.collection("timeline",function(err,coll){
            coll.find({direct_id:new ObjectID(req.param("directid","")),type:1}).sort({create_time:-1}).toArray(wrap.wrap(function(err,recommends){
                return recommends;
            },"thistimeline"));
        });
        //草稿箱
        db.collection("timeline",function(err,coll){
            coll.find({direct_id:new ObjectID(req.param("directid","")),type:2}).sort({create_time:-1}).toArray(wrap.wrap(function(err,recommends){
                return recommends;
            },"thisdrafts"));
        });
        //投递箱
        db.collection("timeline",function(err,coll){
            coll.find({direct_id:new ObjectID(req.param("directid","")),type:3}).sort({create_time:-1}).toArray(wrap.wrap(function(err,recommends){
                return recommends;
            },"thisdeliver"));
        });
        //置顶链接
        db.collection("recommend",function(err,coll){
            coll.find({direct_id:new ObjectID(req.param("directid",""))}).toArray(wrap.wrap(function(err,recommends){
                return recommends;
            },"thisrecommend"));
        });
    });
};
//修改直播分类
exports.modifType = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oType=req.param("directtype","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{type:oType}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//修改直播简介
exports.modifIntro = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oIntro=req.param("description","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{description:oIntro}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//修改直播标题
exports.modifTitle = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oTitle=req.param("title","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{title:oTitle}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//修改直播标题
exports.modifBanner = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oBanner=req.param("banner","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{banner:oBanner}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//修改直播关键字
exports.modifTags = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oTags=req.param("tags","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{tags:oTags}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//修改直播状态
exports.modifState = function (req, res) {
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        var oStatus=req.param("status","");
        db.collection('direct', function (err, conn) {
            conn.update({_id:directid},{ $set:{status:oStatus}});
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//新增置顶
exports.addRecommend = function (req, res) {
    dbpool.execute(function(db){
        //DirectId
        var directid=req.param("directid","");
        //获取前台表单内容
        var recommend ={url:req.param("recommendurl", ""),txt:req.param("recommendtxt", ""),direct_id:new ObjectID(directid)};
        db.collection("recommend", function (err, conn) {
            conn.insert(recommend);
            //db.close();
            res.redirect("/admin/edit/"+directid);
        });
    });
};
//删除置顶
exports.removeRecommend = function (req, res) {
    dbpool.execute(function(db){
        var _id=req.param("_id","");
        var directid=req.param("directid","");
        db.collection("recommend", function (err, conn) {
            conn.findAndRemove({_id:new ObjectID(_id)},function(err,doc){
                res.redirect("/admin/edit/"+directid);
            });
        });
    });
};
//新增直播正文
exports.addLive = function (req, res) {
    var user = req.session["user"];
    dbpool.execute(function(db){
        var directid=req.param("directid","");
        //获取类型用于判断1：发布，2：草稿 3：投递
        var oType=parseInt(req.param("type","0"));
        //获取前台表单内容
        var livetime = req.param("livetime", "");
        if (livetime == '') {
            livetime = exdate.format(new Date(), datePattern);
        }
        livetime = exdate.stringToDate(livetime, datePattern);
        console.log(req.param("livetext", '')+"测试！")
        var live = {
            create_time:livetime,
            text:req.param("livetext", ''),
            type:oType,
            img1:req.param("img1", ''),
            //img2:req.param("img2", ''),
            //img3:req.param("img3", ''),
            direct_id:new ObjectID(directid),
            //location:"",
            create_id:user._id,
            create_face:user.face,
            create_name:user.pin,
            position:""
        };
        db.collection("timeline", function (err, conn) {
            conn.insert(live);
            if(oType == 3){
                res.redirect("/"+req.param("channel", "")+"/"+directid+".html");
            }else{
                res.redirect("/admin/edit/"+directid);
            }
        });
    });
};
//修改当前直播正文信息（对应数据库timeline）
exports.modifyLive = function (req, res) {
    dbpool.execute(function(db){
        var livetime = req.param("livetime", "");
        if (livetime == '') {
            livetime = exdate.format(new Date(), datePattern);
        }
        livetime = exdate.stringToDate(livetime, datePattern);
        //获取前台表单内容
        var live ={
            create_time:livetime,
            text:req.param("livetext", ''),
            picture:req.param("liveimgs", ''),
            type:parseInt(req.param("type","0")),
            img1:req.param("img1", ''),
            //img2:req.param("img2", ''),
            //img3:req.param("img3", ''),
            direct_id:new ObjectID(req.param("directid","")),
            liveid:new ObjectID(req.param("liveid",""))
        };
        db.collection('timeline', function (err, conn) {
            //console.log(live.type)
            conn.update({_id:live.liveid},{ $set:{text:live.text, img1:live.img1,img2:live.img2,img3:live.img3,type:live.type}});
            res.redirect("/admin/edit/"+req.param("directid",""));
        });
    });
};
//删除直播、草稿、投递
exports.delLive = function (req, res) {
    dbpool.execute(function(db){
        //var oType=parseInt(req.param("type","0"));
        var directid=req.param("directid","");
        var liveid=new ObjectID(req.param("id",""));
        db.collection('timeline', function (err, conn) {
            conn.findAndRemove({_id:liveid},function(err,doc){
                res.redirect("/admin/edit/"+directid);
            });
        });
    });
};