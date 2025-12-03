const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');
const Notify = require('../utils/notify')



//-----
function RFIDObserveController(context){
    this.context = context;
    this.notify = new Notify();
    const {Config} = context.models;
    this.COM_PORT = Config.getConfig("RFID_COM_PORT").value
    this.BAUD_RATE = Config.getConfig("RFID_BAUD_RATE").value
    this.DATABITS = Config.getConfig("RFID_DATABITS").value
    this.STOPBIT = Config.getConfig("RFID_STOPBIT").value
    this.PARITY = Config.getConfig("RFID_PARITY").value
}

RFIDObserveController.prototype.regist = function(name, onError, onData){
    this.notify.regist(name, onError, onData)
}

RFIDObserveController.prototype.start = function(){
    this.port = new SerialPort({
        path: this.COM_PORT,
        baudRate: parseInt(this.BAUD_RATE),  
        dataBits: parseInt(this.DATABITS), 
        parity: this.PARITY,
        stopBits: parseInt(this.STOPBIT)
    });
    this.port.on('open', () => {
            console.log('[RS-232] 連接埠已成功開啟！等待資料中...');
    });

    console.log("正在監聽 Pegasus RFID 讀卡機...");

    const parser = this.port.pipe(new DelimiterParser({ delimiter: [0x03] }));
    console.log('正在等待刷卡...');
    // 3. 監聽資料
    parser.on('data', (buffer) => {
        // 此時 buffer 裡的資料已經被 "黏" 好了，而且最後的 03 已經被 Parser 吃掉了
        // 資料會像是: <Buffer 02 30 31 30 35 42 41 30 35 30 34>
        // 步驟 A: 檢查開頭是不是 02
        if (buffer[0] === 0x02) {
            // 步驟 B: 去掉第一個 byte (0x02)，剩下的就是純文字
            const cardData = buffer.slice(1).toString('ascii');
            console.log('-----------------------------');
            console.log(`原始卡號 (Hex String): ${cardData}`);
            // 步驟 C: 嘗試轉換成十進位顯示 (方便對照卡片背面)
            // 這裡示範把整串 Hex 轉成數字
            try {
                const decimalValue = parseInt(cardData, 16);
                console.log(`轉換十進位 (Decimal): ${decimalValue}`);
                this.notify.pushData({cardData, decimalValue})
            } catch (e) {
                console.log('轉換數字失敗');
                this.notify.pushError('轉換數字失敗')
            }
        }
    });
    this.port.on('error', (err) => {
        console.error('錯誤:', err.message);
    });
}


module.exports = function(context){
    return new RFIDObserveController(context)
}