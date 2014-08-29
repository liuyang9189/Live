var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';


/*--------------分页模块-------S-------*/
var totalNum,pageType="";
function dopage(/*totalNum,curPage*/){
    var pageHtml="";
    for(var i=0;i<totalNum;i++){
        pageHtml+="<li page='"+(i+1)+"'><a href='http://127.0.0.1:8080/"+pageType+"/"+(i+1)+"/' target='_self'>"+(i+1)+"</a></li>";
    }
    return pageHtml;
}
function nextpage(curPage){
    if(curPage<totalNum){
        var nextHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/"+pageType+"/"+(parseInt(curPage)+1)+"/' target='_self'>下一页</a></li>"
    }
    return nextHtml;
}
function prevpage(curPage){
    if(curPage!=1){
        var prevHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/"+pageType+"/"+(parseInt(curPage)-1)+"/' target='_self'>上一页</a></li>"
    }
    return prevHtml;
}

/* Tips：分页用法提示(核心代码)，便于遗忘 yuqj。
 results.totalNum= totalNum;
 results.pageBar= dopage();
 results.prev = prevpage(req.param("number",""))
 results.next = nextpage(req.param("number",""));

 //如果页码是1那么就跳过0个取limit个，否则页码是（页码-1）！才能正确的取到当前页面的数据。
 if(pagenumber==1){pagenumber = 0}else{pagenumber = parseInt(pagenumber-1)}
 //显示条数
 var limit=5;
 //总分页数
 coll.find(query).sort([['create_time',-1]]).toArray(wrap.wrap(function(err,directs){
    totalNum = Math.ceil(directs.length/limit);
 }));
 //内容输出
 coll.find(query,{skip:pagenumber*limit,limit:limit}).sort({create_time:-1}).toArray(wrap.wrap(function(err,directs){
    return directs;
 },"newdirects"));

*/

/*--------------分页模块-------E-------*/

//搜索列表（直播）
exports.search_list = function(req, res){
    var user = req.session["user"];
    var oKeywords = "/"+req.param("keywords","")+"/g";
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.keywords = req.param("keywords","");
            if(req.param("type") == 'json'){
                res.send("var data="+JSON.stringify(results));
            }else{
                res.render("search_list",results);
            }
        });
        //搜索直播数据表
        db.collection("direct",function(err,coll){
            coll.find({title:eval(oKeywords)}).toArray(wrap.wrap(function(err,directs){
                for(var i=0;i<directs.length;i++){
                    (function(n){
                        //查找当前直播的timeline最新图片
                        db.collection('timeline', function (err, conn) {
                            conn.findOne({direct_id:directs[n]._id},wrap.wrap(function(err,thisdircetimg){
                                if(thisdircetimg){
                                    var oImage="http://zhibo.yesky.com"+thisdircetimg.img1;
                                    var re=/(.+)(\..+)/;
                                    var str=oImage.match(re);
                                    var oSrc=str[1] +"286x215"+str[2];
                                    directs[n].img=oSrc;
                                }
                            }));
                        });
                    })(i);
                }
                return directs;
            },"searchlist"));
        });
    })
}


//搜索列表（用户）
exports.search_user = function(req, res){
    var user = req.session["user"];
    var oKeywords = "/"+req.param("keywords","")+"/g";
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.keywords = req.param("keywords","");
            if(req.param("type") == 'json'){
                res.send("var data="+JSON.stringify(results));
            }else{
                res.render("search_user",results);
            }
        });
        //搜索用户数据表
        db.collection("user",function(err,coll){
            coll.find({nickname:eval(oKeywords)}).toArray(wrap.wrap(function(err,users){
                for(var i=0;i<users.length;i++){
                    users[i].time=exdate.format(users[i].reg_time,'yyyy-MM-dd HH:mm:ss');
                }
                return users;
            },"searchuser"));
        });
    })
}