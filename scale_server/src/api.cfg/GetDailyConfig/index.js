/**
 * @description 取得每日設定,車輛與司機對照,車輛空車重,工地及運送物品等,加速
 */
module.exports = function(context){
    const {} = context.controller;
    const {DailyConfig} = context.models;
    return [
        (req, res) => {
            DailyConfig.get(req.params.date)
                .then(r => res.status(200).json({code: 200, data: r}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};