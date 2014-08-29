var system = require('child_process');
exports.convert = function(srcImg,destImg,width,height,func){
    var process = system.exec('convert -strip +profile "*" -quality 85% -resize "'+width+'x'+height+'>" ' + srcImg + " " + destImg);
    process.stdout.on('data', function (data) {
        console.log('标准输出：' + data);
    });
    process.on('exit',func);
    console.log("convert end..........");
};
