const fs = require('fs');
const path = `${process.cwd()}/data`;

/**
 * @description 取得過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {} = context.models;
    return [
        (req, res) => {
            const d = fs.readdirSync(path)
                .filter(date => {
                    if (req.query.date && date.includes(req.query.date)) return true;
                    if (req.query.date && !date.includes(req.query.date)) return false;
                    return true;
                })
                .reduce((map, date) => {
                    const p = `${path}/${date}`
                    const d = fs.readdirSync(p)
                        .map(file => JSON.parse(fs.readFileSync(`${p}/${file}`)));
                    return {...map, [date]: d}
                }, {})
            res.status(200).json({code: 200, data: d});
        }
    ]
};