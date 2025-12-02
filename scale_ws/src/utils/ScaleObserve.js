function ScaleObserve(success, failed){
    this.success = success;
    this.failed = failed;
}

ScaleObserve.prototype.onSuccess = function(weight){
    this.success(weight)
}

ScaleObserve.prototype.onError = function(error, message){
    this.failed(error, message)
}

module.exports = ScaleObserve;