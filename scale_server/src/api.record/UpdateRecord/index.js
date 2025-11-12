
/**
 * @description 更新過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            delete req.body.id;
            delete req.body.tags;
            const {date,id} = req.params;
            if(!Record.checkOwner(date, id, req.loginState.id))
                return res.status(400).json({code: 400, messagr: 'The record not yours.'})
            Record.update(date, id, req.body)
                .then(r => res.status(200).json({code: 200, data: r}))
                .catch(err => res.status(400).json({code: 400, message: err}))
        }
    ]
};