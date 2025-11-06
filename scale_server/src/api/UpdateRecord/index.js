const fs = require('fs');
const path = `${process.cwd()}/data`;


/**
 * @description 更新過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {} = context.models;
    return [
        (req, res) => {
            delete req.body.id;
            const {date,id} = req.params;
            const p = `${path}/${date}/${id}.json`;
            if(!fs.existsSync(p)) 
                return res.status(400).json({code: 400, message: 'not found file'});
            const data = fs.readFileSync(p);
            const last = data[data.length - 1];
            const newData = {...last, ...req.body, createdAt: new Date()};
            fs.writeFileSync(p, [...data, newData]);
            return res.status(200).json({code: 200, data: newData})
        }
    ]
};