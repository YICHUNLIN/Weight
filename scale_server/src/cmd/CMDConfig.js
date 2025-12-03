// 設定 cmd 與 method
const getClients = require('./getClients')();
function CMDConfig(){
    return {
        'GET_CLIENTS': getClients
    }
}

module.exports = CMDConfig;