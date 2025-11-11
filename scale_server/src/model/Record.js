const fs = require('fs');

function Record(context){
    this.context = context;
    this.path = `${context.storageRoot}/weights`
    if (!fs.existsSync(this.path))
        fs.mkdirSync(this.path)
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
        fs.writeFileSync(`${p}/${d.id}.json`, JSON.stringify([d]))
        return resolve();
    })
}

/**
 * @description 搜尋
 * @param {*} query ?data=&tags=A,B,C
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
                    .filter(file => {
                        if (query.hasOwnProperty("tags") && query.tags.includes("delete")){
                            const d = JSON.parse(fs.readFileSync(`${p}/${file}`));
                            const last = d[d.length - 1];
                            if (!last.hasOwnProperty("tags")) return false;
                            if (!last.tags.includes("delete")) 
                                 return false;
                        }
                        return true;
                    })
                    .map(file => JSON.parse(fs.readFileSync(`${p}/${file}`)));
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
        const file = `${this.path}/${date}/${id}.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = JSON.parse(fs.readFileSync(file));
        let last = data[data.length - 1];
        if (last.tags && last.tags.includes("delete"))
            return reject({message: 'delete failed, already be deleted'});
        if (last.tags) {
            last.tags = `${last.tags},delete`;
        }
        else {
            last.tags = "delete"
        }
        last.createdAt = new Date();
        fs.writeFileSync(file, [...data, last]);
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
        const file = `${this.path}/${date}/${id}.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = JSON.parse(fs.readFileSync(file));
        let last = data[data.length - 1];
        if (!last.hasOwnProperty("tags"))
            return reject({message: 'undo delete failed, not be deleted A'});
        if (last.tags && !last.tags.includes("delete"))
            return reject({message: 'undo delete failed, not be deleted B'});
        last.tags = last.tags.split(',').filter(p => p !== "delete").join(',');
        last.createdAt = new Date();
        fs.writeFileSync(file, [...data, last]);
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
        const file = `${this.path}/${date}/${id}.json`;
        if (!fs.existsSync(file))
            return reject({message: 'not found file'});
        const data = fs.readFileSync(file);
        const last = data[data.length - 1];
        const newData = {...last, ...content, createdAt: new Date()};
        fs.writeFileSync(p, [...data, newData]);
        return resolve(last)
    })
}


module.exports = function (context) { 
    return new Record(context);
};