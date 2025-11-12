/**
 * @description 刪除過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            const {date, id} = req.params;
            if(!Record.checkOwner(date, id, req.loginState.id))
                return res.status(400).json({code: 400, messagr: 'The record not yours.'})
            Record.delete(date, id)
                .then(d => res.status(200).json({code: 200, data: d}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};