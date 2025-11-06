const fs = require('fs');
const path = require('path');
var express = require('express');
var api = express.Router();
const passport = require('passport');
/**
 * @param app   {express} express 模組
 * @param mids  {array of mid} 中間處理的注入
 */
module.exports = (context, app, mids) => {
    const routesRoot = path.basename(__dirname);
    const base = `${process.cwd()}/src`
    console.log(`=== Load '${routesRoot}' ===`);
    let s = "";
    // // 動態載入模組
    fs.readdirSync(__dirname)
        .filter(file => (file.slice(-3) !== '.js'))
        .forEach(dir => {
            const config = JSON.parse(fs.readFileSync(`${base}/${routesRoot}/${dir}/cfg.json`));
            const t_module = require(`./${dir}/${config.index}`);
            if (t_module) {
                const module = t_module(context, config);
                if (config.auth && !Array.isArray(config.pms)) {
                    console.log(`-[ERROR]${dir}\t${config.method}\t${config.name}\tcfg error: pms is not array`)
                } else {
                    if (config.auth){
                        api[config.method](config.name, 
                            passport.authenticate('ticket_auth', { session:false }), 
                            (req, res, next) => {
                                if (!config.pms || (config.pms && (config.pms.length === 0))) return next();
                                const ps = req.loginState.permissions.map(p => p.name);
                                if (ps.filter(p => config.pms.includes(p)).length > 0) return next();
                                return res.status(400).json({code: 400, message: 'permission not allow'});
                            },
                            module);
                            console.log(`-[Auth]\t${(config.pms && config.pms.length > 0) ? config.pms.join(','): 'ALL'}\t${dir}\t${config.method}\t${config.name}\t${config.desc}`);
                    } else {
                        api[config.method](config.name, module);
                        console.log(`-[NoAuth]\t${dir}\t${config.method}\t${config.name}\t${config.desc}`);
                    }
                }
            }
        });
    app.use(`/${routesRoot}`, mids, api);
}