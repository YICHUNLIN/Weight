/**
 * @description 新增過磅紀錄
 */
module.exports = function(context){
    const {Record, Scale, Config} = context.models;
    const {} = context.models;
    return [
        (req, res, next) => {
            // 貨物名稱
            if (!req.body.hasOwnProperty('ptime')) 
                return res.status(400).json({code: 400, message: 'ptime must be requuired in body.'});
            // 貨物名稱
            if (!req.body.hasOwnProperty('item')) 
                return res.status(400).json({code: 400, message: 'item must be requuired in body.'});
            // 進或出
            if (!req.body.hasOwnProperty('inorout')) 
                return res.status(400).json({code: 400, message: 'inorout must be requuired in body.'});
            // 客戶
            if (!req.body.hasOwnProperty('client')) 
                return res.status(400).json({code: 400, message: 'client must be requuired in body.'});
            // 目的地或來源
            if (!req.body.hasOwnProperty('source_or_destination')) 
                return res.status(400).json({code: 400, message: 'source_or_destination must be requuired in body.'});
            // 司機
            if (!req.body.hasOwnProperty('driver')) 
                return res.status(400).json({code: 400, message: 'driver must be requuired in body.'});
            // 車號
            if (!req.body.hasOwnProperty('car')) 
                return res.status(400).json({code: 400, message: 'car must be requuired in body.'});
            // 數值
            if (!req.body.hasOwnProperty('number')) 
                return res.status(400).json({code: 400, message: 'number must be requuired in body.'});
            // 空車重
            if (!req.body.hasOwnProperty('empty')) 
                return res.status(400).json({code: 400, message: 'empty must be requuired in body.'});
            if (typeof req.body.number !== 'number')
                return res.status(400).json({code: 400, message: 'number must be a number.'}); 
            if (typeof req.body.empty !== 'number')
                return res.status(400).json({code: 400, message: 'empty must be a number.'}); 
            if ((req.body.number - req.body.empty) < 0)
                return res.status(400).json({code: 400, message: 'number error'}); 
            return next();
        },
        (req, res) => {
            delete req.body.tags;
            delete req.body.id;
            req.body.createdBy = req.loginState.id;
            req.body.mode = "supplementary"
            Record.createSupplementary(req.params.date,req.body)
                .then(
                    ({id, date}) =>{
                        return res.status(200).json({code: 200, id, date})
                    }             
                )
                .catch(err => res.status(400).json({code: 400, err}))
        }
    ]
};