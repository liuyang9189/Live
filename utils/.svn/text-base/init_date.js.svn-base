database = require('./database.js');

db = database.getDB();
var now = new Date();

var directs =
    {create_time:now, start_time:now, update_time:now,   "creator" : "余泉君", "updator" : "余泉君", "type": 1, "title" : "第四个直播的标题", "description" : "第四个测试的直播：iPhone 5配备了4英寸大屏、更快的A6处理器和全新的8针Lightning(闪电)接口。iPod nano则拥有更加苗条的造型，并且有多种颜色可供选择。","tags": ["iPhone", "手机新闻", "苹果发布会", "测试","test-tags"], "status" : 1};

var timelines = [
    {
        create_time:new Date(),
        update_time:new Date(),
        display_time:new Date(),
        picture:"http://www.yesky.com/uploadImages/2012/338/559K567Q6JVJ.jpg",
        text:"这是第一条直播正文！这是第一条直播正文！这是第一条直播正文！",
        creator:"余泉君",
        updator:"余泉君",
        type:1
    },
    {
        create_time:new Date(),
        update_time:new Date(),
        display_time:new Date(),
        picture:"http://www.yesky.com/uploadImages/2012/338/559K567Q6JVJ.jpg",
        text:"这是第二条直播正文！这是第二条直播正文！这是第二条直播正文！",
        creator:"余泉君",
        updator:"余泉君",
        type:2
    },
    {
        create_time:new Date(),
        update_time:new Date(),
        display_time:new Date(),
        picture:"http://www.yesky.com/uploadImages/2012/338/559K567Q6JVJ.jpg",
        text:"这是第三条直播正文！这是第三条直播正文！这是第三条直播正文！",
        creator:"余泉君",
        updator:"余泉君",
        type:3
    }
];

var editors = [{name:"吴雪飞",face:"http://www.yesky.com/uploadImages/2012/339/9HO531A9AH4K.jpg",weibo:"wuxf@yesky.com"},
    {name:"余泉君",face:"http://www.yesky.com/uploadImages/2012/334/KX52P1EWNRY4_1.jpg",weibo:"yuqj@yesky.com"}];

db.open(function (err, db) {
    if (!err) {
        console.log("数据初始化脚步开始...");
        db.collection('direct', function (err, conn) {
            conn.insert(directs,function(err,item){
                if(err) {
                    console.log(err);
                    return;
                }
                db.collection("timeline",function(err,coll){
                   for(var i = 0 ;i < timelines.length;i++){
                       timelines[i].direct_id = item[0]._id;
                   }
                   coll.insert(timelines);
                   db.close();
                });

            });
        });


        /*db.collection('editor', function (err, conn) {
            conn.insert(editors);
        });*/

    }
});
/*
var ObjectID = require('mongodb').ObjectID;
db.open(function(err,db){
    if (!err) {
        db.collection("direct",function(err,coll){
           coll.findOne({_id:new ObjectID('50c05d657d1bc825380c998e')},function(err,direct){
               if(err){
                  console.log(err);
               }else{
                  console.log(JSON.stringify(direct));
               }
               db.close();
           });
        });
    }
});
*/
