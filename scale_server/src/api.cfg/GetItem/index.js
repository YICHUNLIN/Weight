/**
 * @description 取得物種
 */
module.exports = function(context){
    const {} = context.controller;
    const {Item} = context.models;
    return [
        (req, res) => {
            Item.getAll()
                .then(d => res.status(200).json({code: 200, data: d}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};