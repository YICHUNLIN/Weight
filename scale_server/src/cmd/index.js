
function Dispatcher(config){
    this.config = config;
}

Dispatcher.prototype.exec = function(content, context){
    if (!this.config.hasOwnProperty(content.cmd)){
        return new Promise((resolve, reject) => {
            return reject({reason: 'not found cmd'});
        })
    }
    return this.config[content.cmd].exec(content.data, context);
}

module.exports = Dispatcher;