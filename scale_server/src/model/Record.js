const fs = require('fs');

function Record(context){
    this.context = context;
    this.path = `${context.storageRoot}/weights`
    if (!fs.existsSync(this.path))
        fs.mkdirSync(this.path)
}

/**
 * @description 確認Record是不是某使用者的,只有Owner能夠更改自己
 * @param {*} date 
 * @param {*} id 
 * @param {*} userId 
 */
Record.prototype.checkOwner = function(date, id, userId){
    const file = `${this.path}/${date}/${id}/metadata.json`;
    if (!fs.existsSync(file)) return false
    const data = JSON.parse(fs.readFileSync(file));
    const last = data[data.length - 1];
    return last.createdBy === userId;
}

/**
 * @description 新增
 * @param {*} data 
 * @returns 
 */
Record.prototype.create = function(data){
    return new Promise((resolve, reject) => {
        const time = new Date();
        const date = time.toISOString().split('T')[0];
        const p = `${this.path}/${date}`;
        if (!fs.existsSync(p))
            fs.mkdirSync(p)
        const d = {id: time.getTime(),...data, createdAt: time};
        fs.mkdirSync(`${p}/${d.id}`)
        fs.writeFileSync(`${p}/${d.id}/metadata.json`, JSON.stringify([d]))
        return resolve();
    })
}

/**
 * @description 根據車號及日期取得資料
 * @param {*} car 
 * @param {*} targetDate 
 * @returns 
 */
Record.prototype.findByCarAndDate = function(car,targetDate){
    return new Promise((resolve, reject) => {
        const result = fs.readdirSync(this.path)
            .filter(date => date === targetDate)
            .reduce((map, date) => {
                const p = `${this.path}/${date}`
                const data = fs.readdirSync(p)
                    .map(dir => JSON.parse(fs.readFileSync(`${p}/${dir}/metadata.json`)))
                    .filter(d => {
                        const last = d[d.length - 1];
                        if (!last.hasOwnProperty("tags")) return true;
                        if (last.tags.includes("delete")) return false;
                        if(last.car === car) return true;
                        return false;
                    });
                return {...map, [date]: data}
            }, {})
        resolve(result)
    })
}

/**
 * @description 搜尋 不包含Delete資料
 * @param {*} query ?date=
 * @returns 
 */
Record.prototype.find = function(query){
    return new Promise((resolve, reject) => {
        const result = fs.readdirSync(this.path)
            .filter(date => {
                if (query.date && date.includes(query.date)) return true;
                if (query.date && !date.includes(query.date)) return false;
                return true;
            })
            .reduce((map, date) => {
                const p = `${this.path}/${date}`
                const d = fs.readdirSync(p)
                    .map(file => JSON.parse(fs.readFileSync(`${p}/${file}/metadata.json`)))
                    .filter(d => {
                        const last = d[d.length - 1];
                        if (last.hasOwnProperty("tags") && last.tags.includes("delete")) 
                            return false;
                        return true;
                    })
                return {...map, [date]: d}
            }, {})
        resolve(result)
    })
}


/**
 * @description 根據 range 找資料,不含deleted
 * @param {*} range array of date
 * @returns 
 */
Record.prototype.findByRange = function(range){
    return new Promise((resolve, reject) => {
        const result = fs.readdirSync(this.path)
            .filter(date => range.includes(date))
            .reduce((map, date) => {
                const p = `${this.path}/${date}`
                const d = fs.readdirSync(p)
                    .map(file => JSON.parse(fs.readFileSync(`${p}/${file}/metadata.json`)))
                    .filter(d => {
                        const last = d[d.length - 1];
                        if (last.hasOwnProperty("tags") && last.tags.includes("delete")) 
                            return false;
                        return true;
                    })
                    .map(d => d[d.length-1])
                return {...map, [date]: d}
            }, {})
        resolve(result)
    })
}


/**
 * @description 取得被刪除的資料
 * @param {*} query ?date=
 * @returns 
 */
Record.prototype.findDeleted = function(){
    return new Promise((resolve, reject) => {
        const result = fs.readdirSync(this.path)
            .reduce((map, date) => {
                const p = `${this.path}/${date}`
                const d = fs.readdirSync(p)
                    .map(file => JSON.parse(fs.readFileSync(`${p}/${file}/metadata.json`)))
                    .filter(d => {
                        const last = d[d.length - 1];
                        if (last.hasOwnProperty("tags") && last.tags.includes("delete")) 
                            return true;
                        return false;
                    })
                return {...map, [date]: d}
            }, {})
        resolve(result)
    })
}

/**
 * @description 刪除
 * @param {*} date 
 * @param {*} id 
 * @returns 
 */
Record.prototype.delete = function(date, id){
    return new Promise((resolve, reject) => {
        const file = `${this.path}/${date}/${id}/metadata.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = JSON.parse(fs.readFileSync(file));
        let last = {...data[data.length - 1]};
        if (last.tags && last.tags.includes("delete"))
            return reject({message: 'delete failed, already be deleted'});
        if (last.tags) {
            last.tags = `${last.tags},delete`;
        }
        else {
            last.tags = "delete"
        }
        last.lastUpdatedAt = new Date();
        fs.writeFileSync(file, JSON.stringify([...data, last]));
        return resolve(last);
    })
}

/**
 * @description 取消刪除
 * @param {*} date 
 * @param {*} id 
 * @returns 
 */
Record.prototype.undoDelete = function(date, id){
    return new Promise((resolve, reject) => {
        const file = `${this.path}/${date}/${id}/metadata.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = JSON.parse(fs.readFileSync(file));
        let last = {...data[data.length - 1]};
        if (!last.hasOwnProperty("tags"))
            return reject({message: 'undo delete failed, not be deleted A'});
        if (last.tags && !last.tags.includes("delete"))
            return reject({message: 'undo delete failed, not be deleted B'});
        last.tags = last.tags.split(',').filter(p => p !== "delete").join(',');
        last.lastUpdatedAt = new Date();
        fs.writeFileSync(file, JSON.stringify([...data, last]));
        return resolve(last)
    })
}

/**
 * @description 更新
 * @param {*} date 
 * @param {*} id 
 * @param {*} content 
 * @returns 
 */
Record.prototype.update = function(date, id, content) {
    return new Promise((resolve, reject) => {
        const file = `${this.path}/${date}/${id}/metadata.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = JSON.parse(fs.readFileSync(file));
        const last = {...data[data.length - 1]};
        const newData = {...last, ...content, lastUpdatedAt: new Date()};
        fs.writeFileSync(file, JSON.stringify([...data, newData]));
        return resolve(last)
    })
}


module.exports = function (context) { 
    return new Record(context);
};