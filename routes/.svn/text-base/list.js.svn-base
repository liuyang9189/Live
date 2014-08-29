var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';

/*--------------分页模块-------S-------*/
var totalNum,pageType,userPin;
function dopage(/*totalNum,curPage*/){
    var pageHtml="";
    for(var i=0;i<totalNum;i++){
        pageHtml+="<li page='"+(i+1)+"'><a href='http://127.0.0.1:8080/list/"+userPin+"/"+pageType+"/"+(i+1)+"' target='_self'>"+(i+1)+"</a></li>";
    }
    return pageHtml;
}
function nextpage(curPage){
    if(curPage<totalNum){
        var nextHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/list/"+userPin+"/"+pageType+"/"+(parseInt(curPage)+1)+"' target='_self'>下一页</a></li>"
    }
    return nextHtml;
}
function prevpage(curPage){
    if(curPage!=1){
        var prevHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/list/"+userPin+"/"+pageType+"/"+(parseInt(curPage)-1)+"' target='_self'>上一页</a></li>"
    }
    return prevHtml;
}
/*我的直播列表*/
exports.myLiveList = function(req, res){
    var masterid = [];
    var user = req.session["user"];
    var praise_num = null;
    var pagenumber = req.param("number","");
    var c = req.param("channel","");
    var oPin = req.param("pin","");
    userPin=oPin;
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.praise = user.praise;
            results.totalNum= totalNum;
            results.pageBar= dopage();
            results.prev = prevpage(req.param("number",""))
            results.next = nextpage(req.param("number",""));
            results.pin = oPin;
            console.log(oPin);
            if(user){
                results.userid = user._id;
                results.masterid = masterid;
            }
            if(req.param("type") == 'json'){
                res.send("var data="+JSON.stringify(results));
            }else{
                res.render("list",results);
            }
        });
        //用户信息
        db.collection('user', function (err, coll) {
            coll.findOne({pin:oPin},wrap.wrap(function(err,dt){
                masterid=dt._id
                return dt;
            },"thisuser"));
        });
        //直播信息
        db.collection("direct",function(err,coll){
            if(pagenumber==1){pagenumber = 0}else{pagenumber = parseInt(pagenumber-1)};
            var limit=5;
            var oType = null;
            switch (c){
                case "q": oType = "群乐频道"; break;
                case "pc": oType = "笔记本/平板"; break;
                case "mobile": oType = "移动互联"; break;
                case "cpu": oType = "配件/显示器"; break;
                case "enterprise": oType = "IT新闻"; break;
                case "digital": oType = "数码影像"; break;
                case "gamelive": oType = "游戏live秀"; break;
                case "hardware": oType = "新品秀"; break;
                case "dh": oType = "数字家电"; break;
                case "diy": oType = "外设/深港"; break;
            }
            //总分页数
            var query = {pin:oPin};
            if(oType != "" && oType != null){ query = {pin:oPin,type:oType}};
            pageType = c;
            coll.find(query).sort([['create_time',-1]]).toArray(wrap.wrap(function(err,directs){
                totalNum = Math.ceil(directs.length/limit);
            }));
            coll.find(query,{skip:pagenumber*limit,limit:limit}).sort({create_time:-1}).toArray(wrap.wrap(function(err,directs){
                for(var i=0;i<directs.length;i++){
                    (function(n){
                        db.collection('timeline', function (err, conn) {
                            conn.findOne({direct_id:directs[n]._id},wrap.wrap(function(err,timelines){
                                if(timelines){
                                    var oImage = "http://127.0.0.1:8080"+timelines.img1;
                                    var re=/(.+)(\..+)/;
                                    var str=oImage.match(re);
                                    var oSrc=str[1] +"312x161"+str[2];
                                    directs[n].img=oSrc;
                                }
                                praise_num=praise_num+directs[n].praise;
                            }));
                        });
                        directs[n].oType=c;
                    })(i)
                }
                return directs;
            },"thislive"));
            coll.find({pin:oPin,type:"群乐频道"}).toArray(wrap.wrap(function(err,directs){
                    return directs;
            },"qltype"));
            coll.find({pin:oPin,type:"笔记本/平板"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"bjbtype"));

            coll.find({pin:oPin,type:"移动互联"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"ydtype"));
            coll.find({pin:oPin,type:"配件/显示器"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"pjtype"));
            coll.find({pin:oPin,type:"IT新闻"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"ittype"));
            coll.find({pin:oPin,type:"数码影像"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"smtype"));
            coll.find({pin:oPin,type:"游戏live秀"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"yxtype"));
            coll.find({pin:oPin,type:"新品秀"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"xptype"));
            coll.find({pin:oPin,type:"数字家电"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"sztype"));
            coll.find({pin:oPin,type:"外设/深港"}).toArray(wrap.wrap(function(err,directs){
                return directs;
            },"wstype"));
        });
    });
};
/*删除直播*/
exports.removeLive = function (req, res) {
    var user=req.session["user"];
    dbpool.execute(function(db){
        var directid=new ObjectID(req.param("directid",""));
        db.collection('direct', function (err, coll) {
            coll.findAndRemove({_id:directid},function(err,doc){
                db.collection('timeline', function (err, conn) {
                    conn.findAndRemove({direct_id:directid},function(err,doc){
                        res.redirect("/list/"+user.pin+"/all/1");
                    });
                });
            });
        });
    });
};