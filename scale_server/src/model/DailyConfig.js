const fs = require('fs');

function DailyConfig(context){
    this.context = context
    this.path = `${context.storageRoot}/daily_configs`;
    if (!fs.existsSync(this.path))
        fs.mkdirSync(this.path)
}

/**
 * @description 更新或新增每日設定
 * @param {*} date 
 * @param {*} content 
 * @returns 
 */
DailyConfig.prototype.update = function(date, content){
    return new Promise((resolve, reject) => {
        const fpath = `${this.path}/${date}.json`
        const data = fs.existsSync(fpath) ? JSON.parse(fs.readFileSync(fpath)) : [];
        let last = data.length > 0 ? {...data[data.length - 1], ...content} : content;
        fs.writeFileSync(fpath, JSON.stringify([...data, last]));
        return resolve(last)
    })
}

/**
 * @description 取得每日的設定
 * @param {*} date 
 * @returns 
 */
DailyConfig.prototype.get = function(date){
    return new Promise((resolve, reject) => {
        const p = `${this.path}/${date}.json`;
        if (!fs.existsSync(p)) return reject({message: 'not found daily config'});
        const data = JSON.parse(fs.readFileSync(p));
        return resolve(data[data.length-1]);
    })
}


module.exports = function(context){
    return new DailyConfig(context);
}