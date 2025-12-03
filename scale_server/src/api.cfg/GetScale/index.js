/**
 * @description 取得Scale資料
 */
module.exports = function(context){
    const {ScaleObserveController} = context.controller;
    const {} = context.models;
    let ERROR = null;
    let DATA = null;
    ScaleObserveController.regist("API-GET[/cfg/scale]", (err) => {
        ERROR = err;
        DATA = null;
    }, (data) => {
        DATA = data;
        ERROR = null;
    })
    return [
        (req, res) => {
            res.status(200).json({code: 200, error: ERROR, data: DATA})
        }
    ]
};