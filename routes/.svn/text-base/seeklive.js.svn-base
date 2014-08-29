var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';



/*搜索*/
exports.seek = function(req, res){
    var oKeywords = "/"+req.param("keywords","")+"/g";
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            res.send("var data="+JSON.stringify(results));
        });
        //搜索直播数据表
        db.collection("direct",function(err,coll){
            coll.find({title:eval(oKeywords)}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"searchlist"));
        });
    })
}
//直播信息
exports.livetitle = function(req, res){
    var oId = req.param("_id","");
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            res.send("var data="+JSON.stringify(results));
        });
        //搜索直播数据表
        db.collection("direct",function(err,coll){
            coll.findOne({_id:new ObjectID(oId)},wrap.wrap(function(err,directs){
                db.collection("user",function(err,coll){
                    coll.findOne({pin:directs.pin},wrap.wrap(function(err,data){
                        directs.create_id = data._id;
                        directs.create_name = data.nickname;
                        directs.create_face = data.face;
                    }));
                });
                return directs;
            },"directs"));
        });
    })
}



//草稿
exports.adddraft = function (req, res) {
    var oId = req.param("_id","");
    dbpool.execute(function(db){
        var directMsg={
            "direct_id" : new ObjectID(oId),//直播id
            "type" : 3,                             //类型用于判断1：发布，2：草稿 3：投递
            "text" : req.param("text",""),          //内容
            "img1" : req.param("img",""),                             //图片1
            "img2" : "",                             //图片2
            "img3" : "",                             //图片3
            "create_time":new Date(),               //创建时间
            "location":"",                           //地理坐标
            "create_id":req.param("create_id",""),                 //创建者ID
            "create_face":req.param("create_face",""),                    //创建者头像
            "create_name":req.param("create_name",""),          //创建者名称
            "position":req.param("position","")          //创建者名称
        }
        db.collection("timeline", function (err, conn) {
            conn.insert(directMsg);
            res.send("var timelines="+JSON.stringify(directMsg));
        });
    });
};

