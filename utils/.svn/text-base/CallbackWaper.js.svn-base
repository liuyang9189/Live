(function(){
    /**
     * 构造一个可以将一个函数进行包装的对象。
     * 用于多个耗时操作执行完成之后，执行一个单独的回调函数，用于统一处理所有的数据.
     * 示例：
     *    var wrapper = require("./CallbackWaper.js").newWrapper();
     *    wrapper.setAllDoneCallback(function (results) {
                //在这个函数中处理查询的所有数据，results为map，key是每个回调函数存放的
                //或者做一些全局的操作，比如关闭数据库等
          });
          functionA(wrapper.wrap(function(){
              //callback A;
              return dataA;
          },"dataA"));
         functionB(wrapper.wrap(function(){
            //callback B;
            return dataA;
         },"dataB"));
         functionC(wrapper.wrap(function(){
            //callback C;
         }));

        这A、B、C三个回调函数是并行执行，当3个函数都执行完成以后，调用setAllDoneCallback设置的函数
        在该函数中，可以通过关键词"dataA","dataB"获取A、B两个回调函数返回的值
     *
     */
   exports.newWrapper = function(){
       var CallbackWaper = function(){
           var instance = this;
           //回调函数的总数
           this.totalCallback = 0;
           //记录回掉函数已经被执行的次数
           this.calls = 0;
           this.allDoneCallback = null;
           this.results = {};
           this.setAllDoneCallback = function(func){
               instance.allDoneCallback = func;
           };

           /**
            * 包装一个函数，并将该函数的执行结果以callbackName进行存放。
            * 存放的数据将传递给allDoneCallback函数进行处理。
            *
            * @param callback
            * @param callbackName
            * @return {Function}
            */
           this.wrap = function(callback, callbackName) {
               instance.totalCallback++;
               //console.log("instance.totalCallback:" + instance.totalCallback);
               return function(){
                   var result = callback.apply(callback,  Array.prototype.slice.call(arguments))
                   instance.calls++;
                   if (callbackName && result) {
                       instance.results[callbackName] = result;
                   }
                   //console.log(callbackName?callbackName:"anonymous callback" +" be called. calls:" + instance.calls + " totalCallback:" + instance.totalCallback);
                   if (instance.calls >= instance.totalCallback && instance.allDoneCallback != null){
                       instance.allDoneCallback(instance.results);
                   }
                   return result;
               };
           };
       };

       return new CallbackWaper();
   };
})();