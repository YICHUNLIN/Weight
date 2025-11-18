/**
 * @description 取得過磅紀錄
 */
module.exports = function(context){
    const {} = context.controller;
    const {Record} = context.models;
    const getDaysArray = function(s,e) {const a=[];for(const d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d).toISOString().split('T')[0]);}return a;};
    var dateReg = /([0-9]{4})-([0-9]{0,2})-([0-9]{0,2})/
    return [
        (req, res) => {
            const {start,end} = req.query;
            if (!start || !end) return res.status(400).json({code: 400, message: 'start and end must be required in query'});
            if (!start.match(dateReg) || !end.match(dateReg)) return res.status(400).json({code: 400, message: 'format error, start and end must be required in query'});
            Record.findByRange(getDaysArray(start, end))
                .then(d => res.status(200).json({code: 200, data: d}))
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};


