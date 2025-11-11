/**
 * @description 設定使用者可以看到的車子
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            const {car, user} = req.params;
        }
    ]
};