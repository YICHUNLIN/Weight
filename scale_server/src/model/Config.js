const fs = require('fs');
function Config(context){
    this.context = context
    this.path = `${context.storageRoot}/config.json`
}

Config.prototype.isSystemInit = function(){
    if (!fs.existsSync(this.path)) return false
    
}

Config.prototype.getConfig = function(){
    return new Promise((resolve, reject) => {
        resolve(fs.readFileSync(this.path))
    })
}

Config.prototype.updateConfig = function(key, value, type){
    return new Promise((resolve, reject) => {
    })
}

Config.prototype.getConfig = function(key){
    if (!fs.existsSync(this.path)) return {error: true, message: 'not init'}
    const configs = JSON.parse(fs.readFileSync(this.path));
    if (!configs[key]) return {error: true, message: `not found config ${key}`};
    const content = configs[key];
    if (content.type === 'boolean'){
        if ((content.value.toLowerCase() === 'false')) return {error: false, value: false};
        if ((content.value.toLowerCase() === 'true')) return {error: false, value: true};
        return {error: true, message: `input error`};
    } else if (content.type === 'int'){
        try{
            return {error: false, value: parseInt(content.value)}
        }catch(e){
            return {error: true, message: 'value is not "int", trans error'}
        }
    } else if (content.type === 'float'){
        try{
            return {error: false, value: parseFloat(content.value)}
        }catch(e){
            return {error: true, message: 'value is not "float", trans error'}
        }
    }
    return {error: true, value: content.value}
}

/**
 * @description 取得所有config 資料
 * @returns 
 */
Config.prototype.getAll = function() {
    return JSON.parse(fs.readFileSync(this.path))
}


Config.prototype.setDefaultConfig = function(){
    return new Promise((resolve, reject) => {
        fs.writeFileSync(this.path, JSON.stringify({
            INITIALIZED: true,
            APP_NAME: {value: '', type: 'string'},
            SCALE_ENABLE: {value: '', type: 'boolean'},
            SCALE_BAUD_RATE: {value: '', type: 'int'},
            SCALE_COM_PORT: {value: '', type: 'string'},
            AUTH_SERVER: {value: '', type: 'string'},
            AUTH_CLIENT_ID: {value: '', type: 'string'},
            AUTH_CLIENT_SECRET: {value: '', type: 'string'},
            AUTH_CLIENT_USER_ACCOUNT: {value: '', type: 'string'},
            AUTH_CLIENT_USER_PASSWORD: {value: '', type: 'string'}
        }))
        resolve()
    })
}

module.exports = function (context) { 
    return new Config(context);
};