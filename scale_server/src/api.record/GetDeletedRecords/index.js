/**
 * @description 取得被刪除的過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            Record.findDeleted()
                .then(d => res.status(200).json({code: 200, data: d}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};