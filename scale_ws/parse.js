const fs = require('fs');
const p = process.cwd()+`/data/weights/2025-11-07/1762487677896.json`;
const d = JSON.parse(fs.readFileSync(p));
console.log(d[0].chunk);