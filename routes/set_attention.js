var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';

/*--------------分页模块-------S-------*/
var totalNum,pageType;
function dopage(/*totalNum,curPage*/){
    var pageHtml="";
    for(var i=0;i<totalNum;i++){
        pageHtml+="<li page='"+(i+1)+"'><a href='http://127.0.0.1:8080/set_attention/"+(i+1)+"' target='_self'>"+(i+1)+"</a></li>";
    }
    return pageHtml;
}
function nextpage(curPage){
    if(curPage<totalNum){
        var nextHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/set_attention/"+(parseInt(curPage)+1)+"' target='_self'>下一页</a></li>"
    }
    return nextHtml;
}
function prevpage(curPage){
    if(curPage!=1){
        var prevHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/set_attention/"+(parseInt(curPage)-1)+"' target='_self'>上一页</a></li>"
    }
    return prevHtml;
}



exports.set_attention = function(req, res){
    var user = req.session["user"];
    var pagenumber = req.param("number","");
    var gzPraise = null;
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.totalNum= totalNum;
            results.pageBar= dopage();
            results.prev = prevpage(req.param("number",""))
            results.next = nextpage(req.param("number",""));
            if(user){
                res.render("set_attention",results);
            }
        });
        db.collection('relations', function (err, coll) {
            if(pagenumber==1){pagenumber = 0}else{pagenumber = parseInt(pagenumber-1)};
            var limit=7;
            coll.find({user_id:user._id}).toArray(wrap.wrap(function(err,directs){
                totalNum = Math.ceil(directs.length/limit);
            }));
            coll.find({user_id:user._id},{skip:pagenumber*limit,limit:limit}).toArray(wrap.wrap(function(err,dt){
                for(var i=0;i<dt.length;i++){
                    (function(n){
                        var oId = dt[n].relate_id;
                        db.collection('user', function (err, conn) {
                            conn.findOne({_id:new ObjectID(oId)},wrap.wrap(function(err,users){
                                var oPin = users.pin;
                                dt[n].pin=oPin;
                                db.collection('direct', function (err, conn) {
                                    conn.find({pin:oPin}).toArray(wrap.wrap(function(err,datas){
                                        for(var l=0;l<datas.length;l++){
                                            gzPraise=gzPraise+datas[l].praise;
                                        }
                                        dt[n].praise=gzPraise;
                                        gzPraise=null;
                                    }));
                                });
                            }));
                        });
                    })(i)

                }
                return dt;
            },"thisgz"));
        });
    });
};