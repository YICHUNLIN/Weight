const { SerialPort } = require('serialport')

const port = new SerialPort({
  path:'/dev/tty.usbserial-1230', // 改成你的
  baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none',
});

let buf = Buffer.alloc(0);

port.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  parseFrames();
});

function parseFrames() {
  while (true) {
    const idx = buf.indexOf(0x1e);           // 以 0x1E 當 section C 的起點
    if (idx < 0) { if (buf.length > 1024) buf = buf.slice(-256); return; }
    if (buf.length < idx + 1 + 14) return;   // 等足 14 bytes
    const payload = buf.slice(idx + 1, idx + 1 + 14); // 14 bytes
    buf = buf.slice(idx + 1 + 14);

    const digits = decodeSevenSegPayload(payload);
    if (digits) {
      console.log('DECODED:', digits.text, digits.debug);
    } else {
      console.log('RAW14:', payload.toString('hex').match(/.{1,2}/g).join(' '));
    }
  }
}

// 嘗試把 14 bytes 視為 7 個數字，每數字 2 bytes（第2個byte可能是小數點/符號/位選）
function decodeSevenSegPayload(bytes14) {
  const segMap = {
    // 標準 7 段 active-high（a b c d e f g），常見碼：
    0x3f: '0', 0x06: '1', 0x5b: '2', 0x4f: '3',
    0x66: '4', 0x6d: '5', 0x7d: '6', 0x07: '7',
    0x7f: '8', 0x6f: '9'
  };
  const pairs = [];
  for (let i = 0; i < 14; i += 2) {
    pairs.push([bytes14[i], bytes14[i+1]]);
  }

  // 嘗試兩種：直通、位元反相
  const tries = [
    { name: 'direct',     f: (b)=>b },
    { name: 'bitwiseNot', f: (b)=> (~b) & 0x7f }, // 僅取 7 段
  ];

  for (const mode of tries) {
    let txt = '';
    let dpPositions = [];
    let neg = false;

    for (let i = 0; i < pairs.length; i++) {
      const [b0, b1] = pairs[i];
      // 猜：b0 是段碼，b1 可能含小數點/旗標；若不是就反過來試
      const candidates = [
        { seg: mode.f(b0) & 0x7f, flag: b1 },
        { seg: mode.f(b1) & 0x7f, flag: b0 },
      ];

      let done = false;
      for (const c of candidates) {
        let ch = segMap[c.seg];
        if (!ch) {
          // 非數字：可能是空白、負號、E r o 等；先用啞值處理
          // 很多儀表用特定段組合代表 '-'：常見是只亮 g 段（0x40）或特定 pattern
          if (c.seg === 0x40) { ch = '-'; }
          else if (c.seg === 0x00) { ch = ' '; }
          else { ch = '?'; }
        }

        // 小數點：常見是另外一個 bit（可能在 flag 的 MSB 或 LSB）
        const hasDP = ((c.flag & 0x80) !== 0) || ((c.flag & 0x08) !== 0);
        if (hasDP) dpPositions.push(i);

        if (ch === '-') neg = true;
        txt += ch;
        done = true;
        break;
      }
      if (!done) txt += '?';
    }

    // 把 dp 加上去（簡單處理：在 dp 的前一位加小數點）
    if (dpPositions.length) {
      // 取最後一個 dp 作為主小數點
      const p = dpPositions[dpPositions.length - 1];
      if (p > 0 && p <= txt.length) {
        txt = txt.slice(0, p) + '.' + txt.slice(p);
      }
    }

    // 清理：去掉前導空白和多餘 '?'
    txt = txt.replace(/^\s+/, '').replace(/\?+$/,'');

    // 若解析到至少有一個 0-9，就回傳
    if (/[0-9]/.test(txt)) {
      if (neg && txt[0] !== '-') txt = '-' + txt;
      return { text: txt, debug: { mode: mode.name, pairs: pairs.map(p=>p.map(x=>x.toString(16).padStart(2,'0'))) } };
    }
  }

  return null;
}