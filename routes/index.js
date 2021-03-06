var database = require("../utils/mongo-db-pool.js");
var wrapper = require("../utils/CallbackWaper.js");
var ObjectID = require('mongodb').ObjectID;
var exdate = require('exdate');
var datePattern = 'yyyy-MM-dd HH:mm:ss';



/*--------------分页模块-------S-------*/
var totalNum,nowPage="";
function dopage(curPage){
    var pageHtml="";
    for(var i=0;i<totalNum;i++){
        pageHtml+="<li page='"+(i+1)+"'><a href='http://127.0.0.1:8080/index/"+(i+1)+"/' target='_self'>"+(i+1)+"</a></li>";
    }
    return pageHtml;
}
function nextpage(curPage){
    if(curPage<totalNum && curPage!=0){
        var nextHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/index/"+(parseInt(curPage)+1)+"/' target='_self'>下一页</a></li>"
    }
    if(curPage==0){
        var nextHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/index/2/' target='_self'>下一页</a></li>"
    }
    return nextHtml;
}
function prevpage(curPage){
    if(curPage!=1 && curPage!=0){
        var prevHtml="<li style='width:65px'><a style='width:65px' href='http://127.0.0.1:8080/index/"+(parseInt(curPage)-1)+"/' target='_self'>上一页</a></li>"
    }
    return prevHtml;
}
/*--------------分页模块-------E-------*/


//首页定向
exports.index = function(req, res){
    var user = req.session["user"];
    var pagenumber = req.param("number","0");
    nowPage = req.param("number","1");
    dbpool.execute(function(db){
        var wrap = wrapper.newWrapper();
        wrap.setAllDoneCallback(function(results){
            results.user = user;
            results.totalNum= totalNum;//总数
            results.pageBar= dopage(pagenumber);
            results.prev = prevpage(req.param("number",""))
            results.next = nextpage(req.param("number",""));
            results.curpage = nowPage;
            res.render('index',results);
        });
        //最新直播
        db.collection("direct",function(err,coll){
            //Tips：如果页码是1那么就跳过0个取limit个，否则页码是（页码-1）！才能正确的取到当前页面的数据。
            if(pagenumber==1){pagenumber = 0} else if(pagenumber == 0){ pagenumber = 0}else{pagenumber = parseInt(pagenumber-1)}
            //显示条数
            var limit=10;
            //pageType = oType;
            //总分页数
            coll.find({"enable":1}).sort([['create_time',-1]]).toArray(wrap.wrap(function(err,directs){
                totalNum = Math.ceil(directs.length/limit);
            }));
            coll.find({"enable":1},{skip:pagenumber*limit,limit:limit}).sort({create_time:-1}).toArray(wrap.wrap(function(err,directs){
                for(var i=0;i<directs.length;i++){
                    (function(n){
                        var c = directs[n].type;
                        //查找当前直播的timeline最新图片
                        db.collection('timeline', function (err, conn) {
                            conn.findOne({direct_id:directs[n]._id},wrap.wrap(function(err,thisdircetimg){
                                if(thisdircetimg){
                                    var oImage=thisdircetimg.img1;
                                    var re=/(.+)(\..+)/;
                                    var str=oImage.match(re);
                                    var oSrc=str[1] +"312x161"+str[2];
                                    directs[n].img=oSrc;
                                }
                            }));
                        });
                    })(i);
                }
                return directs;
            },"newdirects"));
        });
        db.collection("hotpics",function(err,coll){
            coll.find({}).sort({create_time:-1}).toArray(wrap.wrap(function(err,htmls){
                for(var i=0;i<1;i++){
                    return htmls[i];
                }
            },"htmls"));
        });
    })
}



























//登录盒子
exports.loginbox = function (req, res) {
    dbpool.execute(function(db){
        db.collection("user",function(err,coll){
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
                    }else {
                        res.send("password error!");
                    }
                }
            });
        });
    });
};

//首页新增一条直播
exports.newaddr = function (req, res) {
    dbpool.execute(function(db){
        var user = req.session["user"];
        if(user){
            var ss = req.param("type", "");
            var mark = req.param("mark", "");
            //获取类型用于判断1：发布，2：草稿
            var oType=parseInt(req.param("type","0"));
            //获取前台表单内容
            var direct ={
                create_time:new Date(),
                start_time :new Date(),
                update_time:new Date(),
                creator : user.nickname,
                creator_mail : user.email,
                banner : "",
                type: ss.replace(/[ ]/g,""),//1、群乐频道 2、笔记本/平板 3、移动互联 4、配件/显示器 5、IT新闻 6、数码影像 7、游戏live秀 8、新品秀 9、数字家电 10、外设/深港
                mark: mark.replace(/[ ]/g,""),
                title :req.param("title", ""),
                pin :user.pin,
                description :req.param("description", ""),
                tags: req.param("tags", ""),
                status:1, //1为直播进行 2为直播关闭
                enable:1, //1为直播已启用 2为直播已停用（注意：新版直播台此功能已去掉）
                vavoriteed_num:0, //被收藏数
                praise:0 //被收藏数
            };
            db.collection("direct", function (err, conn) {
                conn.insert(direct);
                res.redirect("/admin/edit/"+direct._id);
                //消息任务发送***********************//
                var msgSend={
                    "user_id":user._id,              //用户ID
                    "user_nickname":user.nickname, //用户昵称
                    "user_face":user.face,          //用户昵称
                    "time":new Date(),               //消息时间
                    "type":0,                        //消息类型0 新建一条直播
                    "content":"发布了新直播",      //消息内容.
                    "url":direct.mark+"/"+direct._id+".html" //消息URL
                }
                db.collection("message_send_task_zbt",function(err,coll){
                    coll.insert(msgSend);
                });
                //消息任务发送***********************//
            });
        }
    });
};
//提取首页焦点图


/*exports.index = function(req, res){
 var user = req.session["user"];
 dbpool.execute(function(db){
 if(user){
 db.collection("user",function(err,coll){
 coll.findOne({email:user.email},function(err,usermsg){
 res.render('index',{"usermsg":usermsg});
 });
 });
 }else{
 res.render('index',{"usermsg":null});
 }
 });
 };*/





