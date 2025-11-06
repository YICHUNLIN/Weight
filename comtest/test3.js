const { SerialPort } = require('serialport');

// --- 1. 請修改這裡的設定 ---
//
// 您的磅秤在 Windows 上可能是 'COM3', 'COM4' 等
// 在 Linux/Mac 上可能是 '/dev/ttyUSB0', '/dev/tty.usbmodem1411'
const COM_PORT = '/dev/tty.usbserial-1230'; 
//
// 鮑率 (Baud Rate)，通常是 9600, 19200, or 115200
const BAUD_RATE = 9600; 
//
// --- 結束設定 ---

//
// 我們破解的「羅塞塔石碑」(Rosetta Stone)
// 這是您在程式中需要建立的完整 2-Byte 代碼翻譯表。
const CODEBOOK = {// 數字 '0', 'Space'
    '18e0': '0', // (用於前導空白 或 全零)
    '0ef0': '0', // (在 '2', '3', '4', '8' 之後)
    '0098': '0', // (在 '6', '7' 之後)
    '1ce0': '0', // (在 '0' W之後)
    'e098': '0', // (在 '0', '3', '5', '9' 之後)
    '0018': '0', // (在 '8' 之後) *** [36800] 新增 ***
    
    // 數字 '1'
    '98e0': '1', // (代碼固定)
    
    // 數字 '2'
    '1878': '2', // (在 Space, '1' 之後)
    '1c78': '2', // (在 '4' 之後)
    
    // 數字 '3'
    'ee78': '3', // (在 '2' 之後)
    '9878': '3', // (在 '8' 之後, 也在 '0'/Space 之後) *** [36800] 更新 ***
    '1e18': '3', // (在 '6' 之後)
    
    // 數字 '4'
    '0ef3': '4', // (代碼固定)
    
    // 數字 '5'
    '6618': '5', // (在 '7' 之後)
    '98e6': '5', // (在 '1' 之後) 
    
    // 數字 '6'
    '8e1e': '6', // (在 '1', '3' 之後)
    '181e': '6', // (在 '1' T之後) 
    'eef3': '6', // (在 '2' 之後)
    '0efc': '6', // (在 '3' 之後) *** [36800] 新增 ***
    
    // 數字 '7'
    'ee1e': '7', // (在 '2' 之後)
    '981e': '7', // (在 '1' 之後)
    
    // 數字 '8'
    '18f8': '8', // (在 '1' 之後)
    '1c1e': '8', // (在 '6' 之後) *** [36800] 新增 ***
    
    // 數字 '9'
    '8618': '9', // (代碼固定)
};

// 我們破解的封包標頭 (14 bytes)
const PACKET_HEADER = Buffer.from('66b866f8c37f981e66f8c3df8600', 'hex');
// 資料封包的總長度 (14B Header + 15B Payload + 5B Footer)
const FULL_PACKET_LENGTH = 34;
// 資料在封包中的起始位置
const DATA_OFFSET = 14; 
// 數字資料的長度 (6位數 * 2B)
const DATA_LENGTH = 12;

// 全局緩衝區，用於儲存零碎的資料
let receiveBuffer = Buffer.alloc(0);

/**
 * 解析一個完整的 34-byte 封包
 * @param {Buffer} packetBuffer 
 * @returns {number | null} 返回解析後的重量，或 null
 */
function parseScalePacket(packetBuffer) {
    // 提取 12-byte 的數字資料
    const digitData = packetBuffer.slice(DATA_OFFSET, DATA_OFFSET + DATA_LENGTH);
    
    let displayString = "";
    
    for (let i = 0; i < 6; i++) {
        // 兩兩一組，提取 2-byte 代碼
        const code = digitData.slice(i * 2, i * 2 + 2).toString('hex');
        const digit = CODEBOOK[code];
        
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
        return null;
    }
    
    return weight;
}

/**
 * 處理緩衝區中的所有資料
 */
function processBuffer() {
    // 使用 while 迴圈，確保能一次處理緩衝區中的多個封包
    while (true) {
        // 1. 尋找標頭 (Header)
        const headerIndex = receiveBuffer.indexOf(PACKET_HEADER);
        
        // 如果連標頭都找不到，結束處理，等待新資料
        if (headerIndex === -1) {
            break;
        }

        // 2. 檢查是否有足夠的資料構成一個完整封包
        const packetEndIndex = headerIndex + FULL_PACKET_LENGTH;
        if (receiveBuffer.length < packetEndIndex) {
            // 資料不夠，結束處理，等待新資料
            break;
        }

        // 3. 提取完整的封包
        const packet = receiveBuffer.slice(headerIndex, packetEndIndex);
        
        // 4. 解析封包
        const weight = parseScalePacket(packet);
        if (weight !== null) {
            console.log(`✅ 成功解析重量: ${weight} kg`);
        }

        // 5. 從緩衝區中移除已處理的資料 (非常重要！)
        // (包含標頭前的所有垃圾資料)
        receiveBuffer = receiveBuffer.slice(packetEndIndex);
    }
    
    // 如果緩衝區太大 (例如超過 1KB)，可能代表資料出錯，清空舊資料
    if (receiveBuffer.length > 1024) {
        console.warn("[!] 緩衝區過大，可能已失去同步，將清空...");
        receiveBuffer = receiveBuffer.slice(receiveBuffer.indexOf(PACKET_HEADER));
        if (receiveBuffer.indexOf(PACKET_HEADER) === -1) {
          receiveBuffer = Buffer.alloc(0);
        }
    }
}

// --- 主程式入口 ---

console.log(`[RS-232] 嘗試連接埠 ${COM_PORT} (Baud: ${BAUD_RATE})...`);

const port = new SerialPort({
    path: COM_PORT,
    baudRate: BAUD_RATE,
}, (err) => {
    if (err) {
        console.error(`[!] 錯誤: 無法開啟連接埠: ${err.message}`);
        console.error('請檢查：');
        console.error('  1. 您的 COM_PORT 名稱是否正確？');
        console.error('  2. 您的 USB-to-RS232 轉接器是否已插入？');
        console.error('  3. 磅秤是否已開啟？');
        process.exit(1);
    }
});

port.on('open', () => {
    console.log('[RS-232] 連接埠已成功開啟！等待資料中...');
});

port.on('data', (chunk) => {
    // 1. 將新收到的零碎資料 (chunk) 加到我們的全局緩衝區
    receiveBuffer = Buffer.concat([receiveBuffer, chunk]);
    
    // 2. 呼叫處理函式
    processBuffer();
});

port.on('error', (err) => {
    console.error(`[!] 連接埠發生錯誤: ${err.message}`);
});

port.on('close', () => {
    console.log('[RS-232] 連接埠已關閉。');
});