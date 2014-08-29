
exports.addOrUpdateField = function(list, fieldName,func){
    if (list == null){
        return null;
    }
    for(var i = 0 ;i < list.length;i++) {
        list[i][fieldName] = func(list[i]);
    }
};