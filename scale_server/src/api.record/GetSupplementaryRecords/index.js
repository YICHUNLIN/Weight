/**
 * @description 取得補資料的過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            Record.findSupplementary()
                .then(d => {
                    res.status(200).json({code: 200, data: d});
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).json({code: 400, err});
                })
        }
    ]
};