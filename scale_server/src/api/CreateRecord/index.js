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
            if (!req.body.hasOwnProperty('number')) return res.status(400).json({code: 400, message: 'number must be requuired in body.'});
            next();
        },
        (req, res) => {
            const time = new Date();
            const date = time.toISOString().split('T')[0];
            const content = () => {
                return new Promise((resolve, reject) => {
                    let chunk = [];
                    ScaleRecoderController.start(d => {
                        chunk = [...chunk,d]
                    }, error => reject(error), 
                    () => {
                        setTimeout(() => {
                            ScaleRecoderController.close();
                            const time = new Date();
                            const date = time.toISOString().split('T')[0];
                            const p = `${path}/${date}`;
                            if (!fs.existsSync(p))
                                fs.mkdirSync(p)
                            fs.writeFileSync(`${p}/${time.getTime()}.json`, JSON.stringify({
                                id: time.getTime(),
                                number: req.body.number,
                                chunk
                            }))
                            resolve(chunk)
                        }, 3 * 1000)
                    });
                })
            }
            const onStart = () => {}
            const onError = (name, t, err) => res.status(400).json({code: 400, err, name, t})
            const onDone = (name, t, e) => res.status(400).json({code: 400, e, name, t})
            mamager.addJob(new Job(`ON SCALE RECORD ${date} ${time.getTime()}`,content,onStart,onDone,onError))
        }
    ]
};