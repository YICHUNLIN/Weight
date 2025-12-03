const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

function Notify(){
    this.services = {};
}


Notify.prototype.regist = function(name, onError, onData){
    this.services[name]={onError,onData}
}

Notify.prototype.unRegist = function(name){
    delete this.services[name];
}

Notify.prototype.pushError = function(err){
    Object.values(this.services).forEach(s => s.onError(err))
}

Notify.prototype.pushData = function(data){
    Object.values(this.services).forEach(s => s.onData(data))
}




function ScaleObserveController(context){
    this.context = context;
    this.port = null;
    const {Config} = context.models;
    this.COM_PORT = Config.getConfig("SCALE_COM_PORT").value
    this.BAUD_RATE = Config.getConfig("SCALE_BAUD_RATE").value
    this.SCALE_DATABITS = Config.getConfig("SCALE_DATABITS").value
    this.SCALE_STOPBIT = Config.getConfig("SCALE_STOPBIT").value
    this.SCALE_PARITY = Config.getConfig("SCALE_PARITY").value
    this.notify = new Notify();
}

ScaleObserveController.prototype.regist = function(name, onError, onData){
    this.notify.regist(name, onError,onData)
}

ScaleObserveController.prototype.unRegist = function(name){
    this.notify.unRegist(name)
}



// 轉換資料
ScaleObserveController.prototype.parseScaleData = function(str) {
  // 移除前後空白
  str = str.trim();

  // 1. 分割字串 (用逗號)
  // 預期格式: ST,GS,+0014260kg
  const parts = str.split(',');

  if (parts.length < 3) return null;

  const status = parts[0]; // ST
  const mode = parts[1];   // GS
  const rawValue = parts[2]; // +0014260kg

  // 2. 分離 "數值" 與 "單位"
  // 使用 Regex 抓取: (正負號+數字) 和 (單位)
  const match = rawValue.match(/([+\-]?\d+)([a-zA-Z]+)/);

  if (match) {
    let weight = parseFloat(match[1]);
    const unit = match[2];

    return {
      status: status,      // ST=穩定, US=不穩, OL=過載
      mode: mode,          // GS=毛重, NT=淨重
      weight: weight,      // 數值 (已轉換小數)
      unit: unit,          // kg
      isStable: status === 'ST'
    };
  }
  
  return null;
}

ScaleObserveController.prototype.start = function(onOpen){
    console.log(`[RS-232] 嘗試連接埠 ${this.COM_PORT} (Baud: ${this.BAUD_RATE},DataBits:${this.SCALE_DATABITS},StopBit:${this.SCALE_STOPBIT},Parity:${this.SCALE_PARITY})...`);
    
    this.port = new SerialPort({
        path: this.COM_PORT,
        baudRate: parseInt(this.BAUD_RATE),
        dataBits: parseInt(this.SCALE_DATABITS),
        parity: this.SCALE_PARITY,
        stopBits: this.SCALE_STOPBIT,
    }, (err) => {
        if (err) {
            console.error(`[!] 錯誤: 無法開啟連接埠: ${err.message}`);
            console.error('請檢查：');
            console.error('  1. 您的 COM_PORT 名稱是否正確？');
            console.error('  2. 您的 USB-to-RS232 轉接器是否已插入？');
            console.error('  3. 磅秤是否已開啟？');
            this.notify.pushError(`[!] 錯誤: 無法開啟連接埠: ${err.message}`)
            return;
        }
    });
    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    this.port.on('open', () => {
        console.log('[RS-232] 連接埠已成功開啟！等待資料中...');
        onOpen();
    });

    parser.on('data', (line) => {
        const parsedData = this.parseScaleData(line);
        if (parsedData) {
            this.notify.pushData({origin: line, data: parsedData})
        }
    });

    this.port.on('error', (err) => {
        console.error(`[!] 連接埠發生錯誤: ${err.message}`);
    });

    this.port.on('close', () => {
        console.log('[RS-232] 連接埠已關閉。');
    });
}


module.exports = function (context) { 
    return new ScaleObserveController(context);
};