const { SerialPort } = require('serialport');
const {COM_PORT,BAUD_RATE} = process.env;
function ScaleRecoderController(context){
    this.context = context;
    this.port = null;
}

ScaleRecoderController.prototype.start = function(onData, onError, onOpen){
    console.log(`[RS-232] 嘗試連接埠 ${COM_PORT} (Baud: ${BAUD_RATE})...`);
    this.port = new SerialPort({
        path: COM_PORT,
        baudRate: parseInt(BAUD_RATE),
    }, (err) => {
        if (err) {
            console.error(`[!] 錯誤: 無法開啟連接埠: ${err.message}`);
            console.error('請檢查：');
            console.error('  1. 您的 COM_PORT 名稱是否正確？');
            console.error('  2. 您的 USB-to-RS232 轉接器是否已插入？');
            console.error('  3. 磅秤是否已開啟？');
            onError("[!] 錯誤: 無法開啟連接埠: ${err.message}")
            return;
        }
    });
    this.port.on('open', () => {
        console.log('[RS-232] 連接埠已成功開啟！等待資料中...');
        onOpen();
    });

    this.port.on('data', (chunk) => {
        const hexString = chunk.toString('hex').toUpperCase();
        // 我們特別標記出長度，因為重量數據通常在較長的封包中
        onData(hexString)
    });

    this.port.on('error', (err) => {
        console.error(`[!] 連接埠發生錯誤: ${err.message}`);
        onError(err)
    });

    this.port.on('close', () => {
        console.log('[RS-232] 連接埠已關閉。');
    });
}

ScaleRecoderController.prototype.close = function(){
    this.port?.close((err) => {
        if (err) {
            console.error('Error closing serial port:', err.message);
        } else {
            console.log('Serial port closed');
        }
        this.port = null;
    });
}



module.exports = function (context) { 
    return new ScaleRecoderController(context);
};