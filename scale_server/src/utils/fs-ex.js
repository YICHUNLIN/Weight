const fs = require('fs')

const readJson = (fn) => JSON.parse(fs.readFileSync(fn));

const writeJson = (fn, data) => fs.writeFileSync(fn, JSON.stringify(data));

module.exports = {readJson, writeJson}