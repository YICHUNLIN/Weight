
function Notify(){
    this.services = {};
}


Notify.prototype.regist = function(name, onError, onData){
    this.services[name]={onError,onData}
}

Notify.prototype.unRegist = function(name){
    delete this.services[name];
}

Notify.prototype.pushError = function(err){
    Object.values(this.services).forEach(s => s.onError(err))
}

Notify.prototype.pushData = function(data){
    Object.values(this.services).forEach(s => s.onData(data))
}

module.exports = Notify;