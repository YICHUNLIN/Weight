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
            if (ERROR){
                res.status(400).json({code: 400, error: ERROR})
            } else {
                res.status(200).json({code: 200, data: DATA})
            }
        }
    ]
};