const fs = require('fs');
const {TimeManager, Job} = require('../utils/TimeMamager');
const mamager = new TimeManager("[SCALE PROCESS]");
mamager.start()
function Scale(context){
    this.context = context;
}

Scale.prototype.__lock = function(content){
    const date = new Date()
    return new Promise((resolve, reject) => {
        const onStart = (name) => console.log(`${name} start exec...`)
        const onError = (name, t, err) => reject({name, t, err})
        const onDone = (name, t, e) => resolve({name,t,e})
        mamager.addJob(new Job(`ON SCALE RECORD ${date.getTime()}, at ${date}`,content,onStart,onDone,onError))
    })
}

/**
 * @description 取得地磅資料
 * @param {*} times 預設為3s
 * @returns Promise
 */
Scale.prototype.getData = function(times = 3){
    const {ScaleRecoderController} = this.context.controller;
    const content = () => new Promise((resolve, reject) => {
        let chunk = [];
        ScaleRecoderController.start(d => {
            chunk = [...chunk,d]
        }, error => reject(`${error}, 地磅資訊未取得,有成功儲存輸入資訊`), 
        () => {
            setTimeout(() => {
                ScaleRecoderController.close();
                resolve(chunk)
            }, times * 1000)
        });
    })
    return this.__lock(content)
}

module.exports = function (context) { 
    return new Scale(context);
};