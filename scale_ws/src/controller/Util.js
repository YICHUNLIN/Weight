function Util(context){
    this.context = context;
}

module.exports = function(context){
    return new Util(context);
}