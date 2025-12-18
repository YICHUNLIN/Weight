const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// 1. 設定連線參數 (這是您測試出來的正確參數)
const port = new SerialPort({
  path: 'COM1', // 請改成您的實際 Port, 例如 'COM3' 或 '/dev/ttyUSB0'
  baudRate: 2400,
  dataBits: 7,
  parity: 'even',
  stopBits: 1,
});

// 2. 設定解析器 (Parser)
// 這會自動幫您把碎裂的 Buffer 接起來，直到遇到換行符號 (\r\n) 才吐出一筆完整資料
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// 3. 監聽資料
parser.on('data', (line) => {
  // line 已經是乾淨的字串了，例如: "ST,GS,+0014260kg"
  console.log(`收到原始資料: ${line}`);
  
  const parsedData = parseScaleData(line);
  if (parsedData) {
    console.log('解析結果:', parsedData);
  }
});

// --- 解析邏輯函式 ---
function parseScaleData(str) {
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

    // [注意] 這裡假設地磅是兩位小數 (142.60)，請根據實際螢幕顯示調整除數！
    // 如果螢幕是 14.260，請改除以 1000
    weight = weight / 100; 

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

// 錯誤處理
port.on('error', (err) => {
  console.error('連線錯誤:', err.message);
});