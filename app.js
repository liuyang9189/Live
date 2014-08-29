/**
 * Module dependencies:
 * npm install express
 * npm install ejs
 * npm install mongodb
 * npm install exdate
 */
var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , channel = require('./routes/channel')
    , search = require('./routes/search')
    , live = require('./routes/live')
    , list = require('./routes/list')
    , relations = require('./routes/relations')
    , set = require('./routes/set')
    , set_attention = require('./routes/set_attention')
    , set_fans = require('./routes/set_fans')
    , imageupload = require('./routes/imageupload')
    , http = require('http')
    , path = require('path')
    , ejs = require('ejs')
    , exdate = require("exdate")
    , index = require('./routes/index')
    , edit = require('./routes/edit')
    , seek = require('./routes/seeklive');

ejs.filters.format = function(date,pattern) {
    try {
        if (pattern) {
            return exdate.format(date,pattern.replace(/;/g,':'));
        }else{
            return exdate.format(date);
        }
    }catch(except) {
        console.log(except);
        return date;
    }
};
var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(express.favicon());
//app.use(express.logger('dev'));//打日志
app.use(express.bodyParser({uploadDir:'./public/images/'}));
app.use(express.methodOverride());
if ('slave' == process.env.ROLE || 'master' == process.env.ROLE){
    app.set('env', 'production');
}

//这里加上主从进程判断，如果环境变量中设置ROLE=slave，则表示该进程不提供session支持，不能登录等
if ('slave' == process.env.ROLE) {
    app.all("*",function(req, res, next){
        if (req.path.match(/\.do$/g) || req.path == '/admin/login') {
            res.redirect("/");
        }else{
            next();
        }
    });
}else{
    app.use(express.cookieParser('yesky_secret'));
    app.use(express.session());
    //统一验证用户是否登陆
    //以.do结尾的url，为后台的url，需要登录以后才可以访问
    /*app.all("*",function(req, res, next){
        var user = req.session["user"];
        if (user || ! req.path.match(/\.do$/g)){
            next();
        } else {
            res.redirect("/");
        }
    });*/
}
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


/* 退出登录 */
app.get('/logout.do', user.logout);

/* 直播首页 */
app.get('/',index.index);//直播首页
app.get('/index/:number',index.index);//直播首页        <%-htmls.html%>

app.get('/superadmin.do',user.superadmin);//超级管理员页面 /* <%=htmls.html%> */
app.post('/superrelease.do',user.superrelease);//超级管理员编辑页--html编辑发布
app.get('/superremoveuser.do',user.superremoveuser);//超级管理员页面--remove user
app.get('/superremovedirect.do',user.superremovedirect);//超级管理员页面--remove direct
app.get('/useradmin.do',user.useradmin);//用户权限管理页
app.get('/white.do',user.white);//白名单更改
app.get('/adminaccredit.do',user.adminaccredit);//管理员授权修改

app.post('/login.do', index.loginbox);//登录接口
app.get('/newaddr.do', index.newaddr);//创建直播


/* 频道列表 */
app.get('/:channel/:number/', channel.channel);//创建直播

/* 搜索列表 */
app.get('/search.do', search.search_list);
app.get('/search_user.do', search.search_user);

/* 关注校验 */
/*app.get('/visirelation.do', relations.visirelation);//关注按钮*/
app.get('/checkrelation.do', relations.checkrelation);//校验用户关系
app.get('/updaterelation.do', relations.updaterelation);//更新用户关系

/* 消息中心 */
app.get('/message.do', relations.message);

/* 邀请协助 */
app.get('/invite.do', relations.invite);
app.get('/del_invite.do', relations.del_invite);//取消当前直播的邀请用户
app.get('/init_invite.do', relations.init_invite);//邀请用户初始化数据





//用户
app.get('/admin/', user.admin);//登录页
app.post('/admin/login', user.login);//登录接口
app.get('/register/', user.zc);//注册页
app.post('/admin/register', user.register);//注册接口
app.get('/admin/verification', user.verification);//注册验证
app.post('/admin/imageUpload', imageupload.imageUpload);

app.get('/admin/edit/:directid', edit.edit);//添加内容页
app.get('/admin/modifType', edit.modifType);//修改直播分类
app.get('/admin/modifIntro', edit.modifIntro);//修改直播简介
app.get('/admin/modifTitle', edit.modifTitle);//修改直播标题
app.get('/admin/modifTags', edit.modifTags);//修改直关键字
app.get('/admin/modifBanner', edit.modifBanner);//修改直播标题背景
app.get('/admin/modifState', edit.modifState);//修改直播状态
app.get('/admin/addRecommend', edit.addRecommend);//新增置顶链接
app.get('/admin/removeRecommend', edit.removeRecommend);//删除置顶链接
app.get('/admin/addLive', edit.addLive);//新增直播正文
app.get('/admin/modifyLive', edit.modifyLive);//修改当前直播正文信息
app.get('/admin/delLive', edit.delLive);//删除直播、草稿、投递
//直播内容页
app.get('/:channel/:directid.html', live.mylive);//直播内容页
app.get('/praise/port', live.praise);//赞
//直播列表页
app.get('/list/:pin/:channel/:number', list.myLiveList);//直播列表页
app.get('/removelive', list.removeLive);//删除直播
//设置
app.get('/set', set.set);//个人设置
app.get('/setnickname', set.setnickname);//修改用户昵称
app.get('/setsex', set.setsex);//修改用户性别
app.get('/setpassword', set.setpassword);//修改用户密码
app.get('/setface', set.setface);//修改用户头像
app.get('/set_attention/:number', set_attention.set_attention);
app.get('/set_fans/:number', set_fans.set_fans);
///app.get('/:type/:number/',index.liveIndex);//直播分页

//直播台插件
app.get('/seek', seek.seek);//搜索
app.get('/livetitle', seek.livetitle);//搜索
app.get('/adddraft', seek.adddraft);//草稿


//初始化数据库连接池
var MongoDBPool = require("./utils/mongo-db-pool.js").MongoDBPool;
dbpool = new MongoDBPool(null,function(){
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });

    //消息提示
    setInterval(function(){
        dbpool.execute(function(db){
            db.collection("message_send_task_zbt",function(err,coll){
                if (!err) {
                    coll.find({}).toArray(function(err,tasks){
                        if(tasks!=null){
                            for(var i = 0;i < tasks.length;i++) {
                                (function(task){
                                    db.collection('message_send_task_zbt', function (err, conn) {
                                        conn.findAndRemove({user_id:task.user_id},function(err,doc){
                                        });
                                    });
                                    db.collection("relations", function (err, rea_coll) {
                                        rea_coll.find({user_id:task.user_id}).toArray(function(err, fans) {
                                            console.log("查询"+JSON.stringify(fans).toString());
                                            for(var k = 0;k < fans.length;k++){
                                                (function(fans){
                                                    //操作message表
                                                    db.collection("message", function (err, message_coll) {
                                                        var message={
                                                            "user_id":fans.relate_id,        //用户ID
                                                            "form_user":task.user_id,        //消息来源
                                                            "user_name":fans.relate_name,   //用户昵称
                                                            "form_name":task.user_nickname, //消息来源昵称
                                                            "form_face":task.user_face, //消息来源头像
                                                            "form_time_normal":task.time,    //消息发布时间（标准）
                                                            "form_time":exdate.format(task.time,'MM-dd HH:mm'),//消息发布时间（短格式）
                                                            "message" : task.content,        //消息类容
                                                            "type":task.type,                   //消息类型
                                                            "url":task.url                   //消息URL
                                                        }
                                                        message_coll.insert(message);
                                                        console.log(message+"messagemessagemessagemessagemessage")
                                                    });
                                                })(fans[k]);
                                            }
                                        });
                                    });
                                })(tasks[i]);
                            }
                        }
                    });
                }
            });
        });
    },5000);
});






