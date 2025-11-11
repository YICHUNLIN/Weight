const { SerialPort } = require('serialport');

// 您的磅秤在 Windows 上可能是 'COM3', 'COM4' 等
// 在 Linux/Mac 上可能是 '/dev/ttyUSB0', '/dev/tty.usbmodem1411'
function Scale(COM_PORT,BAUD_RATE,CODEBOOK){
    this.COM_PORT = COM_PORT;
    this.BAUD_RATE = BAUD_RATE;
    this.CODEBOOK = CODEBOOK;
    // 我們破解的封包標頭 (14 bytes)
    this.PACKET_HEADER = Buffer.from('66b866f8c37f981e66f8c3df8600', 'hex');
    // 資料封包的總長度 (14B Header + 15B Payload + 5B Footer)
    this.FULL_PACKET_LENGTH = 34;
    // 資料在封包中的起始位置
    this.DATA_OFFSET = 14; 
    // 數字資料的長度 (6位數 * 2B)
    this.DATA_LENGTH = 12;
    // 全局緩衝區，用於儲存零碎的資料
    this.receiveBuffer = Buffer.alloc(0);
}



/**
 * 解析一個完整的 34-byte 封包
 * @param {Buffer} packetBuffer 
 * @returns {number | null} 返回解析後的重量，或 null
 */
Scale.prototype.parseScalePacket = function(packetBuffer) {
    // 提取 12-byte 的數字資料
    const digitData = packetBuffer.slice(this.DATA_OFFSET, this.DATA_OFFSET + this.DATA_LENGTH);
    
    let displayString = "";
    
    for (let i = 0; i < 6; i++) {
        // 兩兩一組，提取 2-byte 代碼
        const code = digitData.slice(i * 2, i * 2 + 2).toString('hex');
        const digit = this.CODEBOOK[code];
        
        if (digit === undefined) {
            console.warn(`[!] 警告：發現未知的數字代碼 ${code}`);
            displayString += '?'; // 用 '?' 標記未知代碼
        } else {
            displayString += digit;
        }
    }

    // 將 "001830" 這樣的字串轉換為數字 1830
    const weight = parseInt(displayString, 10);
    
    if (isNaN(weight)) {
        console.error(`[!] 錯誤：無法解析顯示字串 "${displayString}"`);
        return {weight: null, message: displayString};
    }
    
    return {weight};
}

/**
 * 處理緩衝區中的所有資料
 */
Scale.prototype.processBuffer = function(onParseSuccess, onParseError) {
    // 使用 while 迴圈，確保能一次處理緩衝區中的多個封包
    while (true) {
        // 1. 尋找標頭 (Header)
        const headerIndex = this.receiveBuffer.indexOf(this.PACKET_HEADER);
        
        // 如果連標頭都找不到，結束處理，等待新資料
        if (headerIndex === -1) {
            break;
        }

        // 2. 檢查是否有足夠的資料構成一個完整封包
        const packetEndIndex = headerIndex + this.FULL_PACKET_LENGTH;
        if (this.receiveBuffer.length < packetEndIndex) {
            // 資料不夠，結束處理，等待新資料
            break;
        }

        // 3. 提取完整的封包
        const packet = this.receiveBuffer.slice(headerIndex, packetEndIndex);
        
        // 4. 解析封包
        const {weight, message} = this.parseScalePacket(packet);
        if (weight !== null) {
            console.log(`✅ 成功解析重量: ${weight} kg`);
            onParseSuccess(weight);
        } else{
            onParseError(message);
        }

        // 5. 從緩衝區中移除已處理的資料 (非常重要！)
        // (包含標頭前的所有垃圾資料)
        this.receiveBuffer = this.receiveBuffer.slice(packetEndIndex);
    }
    
    // 如果緩衝區太大 (例如超過 1KB)，可能代表資料出錯，清空舊資料
    if (this.receiveBuffer.length > 1024) {
        console.warn("[!] 緩衝區過大，可能已失去同步，將清空...");
        this.receiveBuffer = this.receiveBuffer.slice(this.receiveBuffer.indexOf(this.PACKET_HEADER));
        if (this.receiveBuffer.indexOf(this.PACKET_HEADER) === -1) {
          this.receiveBuffer = Buffer.alloc(0);
        }
    }
}

Scale.prototype.start = function(onSuccess, onError){
    console.log(`[RS-232] 嘗試連接埠 ${this.COM_PORT} (Baud: ${this.BAUD_RATE})...`);
    const port = new SerialPort({
        path: this.COM_PORT,
        baudRate: this.BAUD_RATE,
    }, (err) => {
        if (err) {
            console.error(`[!] 錯誤: 無法開啟連接埠: ${err.message}`);
            console.error('請檢查：');
            console.error('  1. 您的 COM_PORT 名稱是否正確？');
            console.error('  2. 您的 USB-to-RS232 轉接器是否已插入？');
            console.error('  3. 磅秤是否已開啟？');
        }
    });
    port.on('open', () => {
        console.log('[RS-232] 連接埠已成功開啟！等待資料中...');
    });

    port.on('data', (chunk) => {
        // 1. 將新收到的零碎資料 (chunk) 加到我們的全局緩衝區
        this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunk]);
        
        // 2. 呼叫處理函式
        this.processBuffer(onSuccess, (error) => onError(error, chunk));
    });

    port.on('error', (err) => {
        console.error(`[!] 連接埠發生錯誤: ${err.message}`);
    });

    port.on('close', () => {
        console.log('[RS-232] 連接埠已關閉。');
    });
}

module.exports = Scale;