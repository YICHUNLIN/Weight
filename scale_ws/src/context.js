const fs = require('fs');
const db = require('./model');
const controllers = require('./controller')
function Context(){
    this.init();
}

Context.prototype.init = function(){
    this.storageRoot = process.cwd() + '/data';
    if (!fs.existsSync(this.storageRoot))
        fs.mkdirSync(this.storageRoot)
    this.models = db(this);
    this.controller = controllers(this);
}

module.exports = Context;