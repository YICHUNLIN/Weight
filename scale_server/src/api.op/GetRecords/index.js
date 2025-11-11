/**
 * @description 取得某車子的過磅紀錄?date=&car=
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    return [
        (req, res) => {
            const {car, date} = req.query;
            //MARK:check 使用者是不是可以看到此car資料
            if (!car || !date)
                return res.status(400).json({code: 400, message: `car and date must be required in quert.`})
            Record.findByCarAndDate(car, date)
                .then(d => res.status(200).json({code: 200, data: d}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};