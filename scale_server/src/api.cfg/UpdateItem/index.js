/**
 * @description 更新物種
 */
module.exports = function(context){
    const {} = context.controller;
    const {Item} = context.models;
    return [
        (req, res) => {
            Item.update(req.body.content)
                .then(r => res.status(200).json({code: 200, data: r}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};