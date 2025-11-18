/**
 * @description 取得物種
 */
module.exports = function(context){
    const {} = context.controller;
    const {} = context.models;
    return [
        (req, res) => {
            return res.status(200).json({code: 200, name: process.env.APP_NAME})
        }
    ]
};