var wrapper = require("../utils/CallbackWaper.js");
var fs = require('fs');
var exdate = require('exdate');

exports.preImageUpload = function(req, res){
    res.render("imageUpload",{});
};
exports.imageUpload = function(req, res){

    var oDate=new Date();
    var upImgTime=oDate.getFullYear()+""+(oDate.getMonth()+1)+""+oDate.getDate()+""+oDate.getHours()+""+oDate.getMinutes()+""+oDate.getSeconds()+oDate.getTime();
    console.log(upImgTime+"---1");
    var oImageName=req.files.image.name;
    console.log(oImageName+"---2");
    var str=oImageName.lastIndexOf('\.');
    console.log(str+"---3");
    var imgName=oImageName.substring(0,str);//图片前缀
    var suffix=oImageName.substring(str);//图片后缀
    var tmp_path = req.files.image.path;
    console.log(tmp_path+"----");
    //var target_path = './public/images/' + req.files.image.name;
    var target_path = './public/images/'+upImgTime;
    var image = require("../utils/image.js");
    var wrap = wrapper.newWrapper();
    var oType = req.param("type","");//1注册 2头图背景 3直播内容图
    console.log(oType);
    //console.log(JSON.stringify(req.files.image).toString()+"dasdsadsa");
    wrap.setAllDoneCallback(function(results){
        console.log(results);
        fs.unlink(tmp_path,function(){
            console.log("delete file") ;
        });
        res.send("<span>/images/"+ upImgTime+suffix +"</span>");
    });
    if(oType == 1){
        image.convert(tmp_path,target_path+"160x160"+suffix,160,160,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image1");

        image.convert(tmp_path,target_path+"56x56"+suffix,56,56,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image2");
    }else if(oType == 2){
        image.convert(tmp_path,target_path+"1000x140"+suffix,1000,140,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image3");
    }else if(oType == 3){
        image.convert(tmp_path,target_path+"154x105"+suffix,154,105,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image4");
        image.convert(tmp_path,target_path+"312x161"+suffix,312,161,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image5");
        image.convert(tmp_path,target_path+"580x400"+suffix,594,359,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image6");
    }else if(oType == 4){
        image.convert(tmp_path,target_path+"594x308"+suffix,594,308,wrap.wrap(function(ret_code){
            if (ret_code == 0) {
                return upImgTime+suffix
            }
        }),"image7");
    }


};

/*
exports.uploadByBase64 = function(req,res){

    var base64Data = req.param("imgdata","").replace(/^data:image\/\w+;base64,/, "");
    var imgname = req.param("imgname");
    var dataBuffer = new Buffer(base64Data, 'base64');

    var upImgTime= exdate.format(new Date(),'yyyyMMddHHmmss');
    var target_path = './public/images/' + upImgTime + "_" + imgname;
    var url = '/images/' + upImgTime + "_" + imgname;
    fs.writeFile(target_path, dataBuffer, function(err) {
        if(err){
            res.send("err");
        }else{
            console.log("111111111111111") ;
            res.send(url);
        }
    });
}*/
