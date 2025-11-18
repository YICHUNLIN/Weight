const fs = require('fs');
function Item(context){
    this.context = context
    this.path = `${context.storageRoot}/items.json`
}

/**
 * @description 取得所有物種
 * @returns 
 */
Item.prototype.getAll = function(){
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(this.path))
            return reject({message: 'not found items'})
        const items = JSON.parse(fs.readFileSync(this.path));
        resolve(items)
    })
}

/**
 * @description 更新
 * @param {*} newList 
 * @returns 
 */
Item.prototype.update = function(newList) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(this.path))
            return reject({message: 'not found items'});
        fs.writeFileSync(this.path,JSON.stringify(newList));
        resolve({message: 'update successed.'})
    })
}

/**
 * @description 產生基本的項目
 * @returns 
 */
Item.prototype.genDefaultItems = function(){
    return new Promise((resolve, reject) => {
        if (fs.existsSync(this.path))
            return reject({message: 'items already exists.'})
        fs.writeFileSync(JSON.stringify([
                {"name":"土:B5"},{"name":"土:B2-3"},{"name":"土:土石混合物"},
                {"name":"材:再生石"},{"name":"材:二分石"},{"name":"材:三分石"},
                {"name":"材:六分石"},{"name":"材:機制砂"},{"name":"材:粉刷砂(1:3)"},
                {"name":"材:碎石級配"},{"name":"廢:瀝青刨除料"},{"name":"工:其他"}
            ]));
        resolve({message: 'Generate finished.'})
    })
}


module.exports = function(context){
    return new Item(context)
}