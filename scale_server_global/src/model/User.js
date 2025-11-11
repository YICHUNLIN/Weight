const fs = require('fs')
function User(context){
    this.context = context;
    this.path = `${context.storageRoot}/users`
    if (!fs.existsSync(this.path))
        fs.mkdirSync(this.path)
}

/**
 * @description check 某使用者是否存在
 * @param {*} id 
 * @returns 
 */
User.prototype.__checkUserExists = function(id){
    return fs.existsSync(`${this.path}/${id}`);
}

/**
 * @description 新增使用者的資料夾
 * @param {*} id 
 */
User.prototype.__createUserFolder = function(id){
    if (!this.__checkUserExists(id))fs.mkdirSync(`${this.path}/${id}`)
}


/**
 * @description 設定使用者的資料
 * @param {*} id 
 * @param {*} data 
 */
User.prototype.setMetadata = function(id, data){
    return new Promise((resolve, reject) => {
        this.__createUserFolder(id);
        const file = `${this.path}/${id}/metadata.json`;
        const meta = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
        fs.writeFileSync(JSON.stringify([...meta, data]))
        return resolve(data)
    })
}

/**
 * @description 設定使用者可以看到的車子
 * @param {*} id 
 * @param {*} car 
 */
User.prototype.setCarSee = function(id, car){
    return new Promise((resolve, reject) => {
        if (!this.__checkUserExists(id)) return reject({message: 'not found user'})
        const file = `${this.path}/${id}/carsee.json`;
        const carsee = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
        if (carsee.includes(car)) return reject({message: 'car already can see'});
        fs.writeFileSync(file, [...carsee, car]);
        return resolve(car)
    });
}

/**
 * @description 取得所有使用者可以看到的車子資料
 */
User.prototype.getCarSee = function(id){
    return new Promise((resolve, reject) => {
        if (!this.__checkUserExists(id)) return reject({message: 'not found user'})
        const file = `${this.path}/${id}/carsee.json`;
        if (!fs.existsSync(file)) return reject({message: 'not found car see'});
        return resolve(JSON.parse(fs.readFileSync(file)));
    });
}

/**
 * @description 確認某人可不可以看到某車的資料
 * @param {*} id 
 * @param {*} car 
 */
User.prototype.checkCarCanSee = function(id, car){
    return new Promise((resolve, reject) => {
        if (!this.__checkUserExists(id)) return reject({message: 'not found user'})
        const file = `${this.path}/${id}/carsee.json`;
        const carsee = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
        if (carsee.includes(car)) return resolve(true);
        return resolve(false);
    });
}

module.exports = function(context){
    return new User(context);
}