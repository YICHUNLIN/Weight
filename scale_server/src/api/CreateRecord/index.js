const fs = require('fs');
const path = `${process.cwd()}/data`;
const {TimeManager, Job} = require('../../utils/TimeMamager');
// 避免同時開port的問題
const mamager = new TimeManager("[SCALE PROCESS]");
mamager.start()
/**
 * @description 新增過磅紀錄
 */
module.exports = function(context){
    const {ScaleRecoderController} = context.controller;
    const {} = context.models;
    return [
        (req, res, next) => {
            // 貨物名稱
            if (!req.body.hasOwnProperty('createdBy')) 
                return res.status(400).json({code: 400, message: 'createdBy must be requuired in body.'});
            // 貨物名稱
            if (!req.body.hasOwnProperty('item')) 
                return res.status(400).json({code: 400, message: 'item must be requuired in body.'});
            // 進或出
            if (!req.body.hasOwnProperty('inorout')) 
                return res.status(400).json({code: 400, message: 'inorout must be requuired in body.'});
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
            const time = new Date();
            const date = time.toISOString().split('T')[0];
            const content = () => {
                return new Promise((resolve, reject) => {
                    let chunk = [];
                    const time = new Date();
                    const date = time.toISOString().split('T')[0];
                    const p = `${path}/${date}`;
                    if (!fs.existsSync(p))
                        fs.mkdirSync(p)
                    const data = {id: time.getTime(),...req.body, createdAt: time}
                    ScaleRecoderController.start(d => {
                        chunk = [...chunk,d]
                    }, error => {
                        fs.writeFileSync(`${p}/${time.getTime()}.json`, JSON.stringify([
                            {
                                ...data,
                                message: error
                            }
                        ]))
                        reject(`${error}, 地磅資訊未取得,有成功儲存輸入資訊`);
                    }, 
                    () => {
                        setTimeout(() => {
                            ScaleRecoderController.close();
                            fs.writeFileSync(`${p}/${time.getTime()}.json`, JSON.stringify(
                                [
                                    {
                                        ...data,chunk
                                    }
                                ]
                            ))
                            resolve(chunk)
                        }, 3 * 1000)
                    });
                })
            }
            const onStart = (name) => console.log(`${name} start exec...`)
            const onError = (name, t, err) => res.status(400).json({code: 400, err, name, t})
            const onDone = (name, t, e) => res.status(200).json({code: 200, e, name, t})
            mamager.addJob(new Job(`ON SCALE RECORD ${date} ${time.getTime()}`,content,onStart,onDone,onError))
        }
    ]
};