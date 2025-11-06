const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

// *************
// !! 請修改這裡 !!
// *************
const YOUR_PORT_PATH = '/dev/tty.usbserial-1230'; // 或是 '/dev/ttyUSB0' 等
const YOUR_BAUD_RATE = 9600;   // !! 您必須知道正確的鮑率

const port = new SerialPort({
  path: YOUR_PORT_PATH,
  baudRate: YOUR_BAUD_RATE,
  // 猜測的設定，如果不行，您可能需要嘗試 8, 'none', 1
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
});

// 建立一個解析器，告訴它我們的「分隔符號」是 0x78
// includeDelimiter: false (預設) 代表我們拿到的數據 "不包含" 0x78 本身
const parser = port.pipe(new DelimiterParser({ delimiter: Buffer.from([0x78]) }));

console.log(`正在監聽 ${YOUR_PORT_PATH}，使用 0x78 作為定界符...`);

// 監聽 'data' 事件，但這次是從 'parser' 監聽，而不是 'port'
parser.on('data', (packet) => {
  // 'packet' 是一個 "完整" 的 Buffer，不包含 0x78
  
  // 為了方便觀看，我們將 Buffer 轉成十六進位字串
  const hexString = packet.toString('hex').toUpperCase();
  
  // 我們特別標記出長度，因為重量數據通常在較長的封包中
  console.log(`[長度: ${packet.length}] -> ${hexString}`);
});

port.on('error', (err) => {
  console.error('SerialPort 錯誤: ', err.message);
});

port.on('open', () => {
  console.log('SerialPort 已開啟');
});