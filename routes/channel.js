var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';


/*--------------分页模块-------S-------*/
var totalNum,pageType="";
function dopage(curPage){
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

//频道页定向
exports.channel = function(req, res){
    var user = req.session["user"];
    var oType = req.param("channel","");
    var pagenumber = req.param("number","");
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.totalNum= totalNum;//总数
            results.pageBar= dopage(req.param("number",""));
            results.prev = prevpage(req.param("number",""))
            results.next = nextpage(req.param("number",""));
            res.render('channel',results);
        });
        //当前分类直播列表
        db.collection("direct",function(err,coll){
            //数据判断
            var query = {"enable": 1};
            if(oType != ""){ query = {"enable": 1,mark:oType}};
            //Tips：如果页码是1那么就跳过0个取limit个，否则页码是（页码-1）！才能正确的取到当前页面的数据。
            if(pagenumber==1){pagenumber = 0}else{pagenumber = parseInt(pagenumber-1)}
            //显示条数
            var limit=5;
            pageType = oType;
            //总分页数
            coll.find(query).sort([['create_time',-1]]).toArray(wrap.wrap(function(err,directs){
                totalNum = Math.ceil(directs.length/limit);
            }));
            //内容输出
            coll.find(query,{skip:pagenumber*limit,limit:limit}).sort({create_time:-1}).toArray(wrap.wrap(function(err,directs){
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
            },"newdirects"));
        });
    })
}
