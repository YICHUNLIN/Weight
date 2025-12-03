var CryptoJS = require("crypto-js");
const {v4: uuidv4} = require('uuid');
const CMDDispatcher = require('../cmd')
const CmdConfig = require('../cmd/CMDConfig.js')
const dispatcher = new CMDDispatcher(CmdConfig());

function Handler(context){
    this.context = context;
}

/** */
Handler.prototype.onJoin = function(socket){
}

/** */
Handler.prototype.onConnect = function(socket){
    // 發送一個 invite code 與時間, invite code 需要加密
    var invite_code = CryptoJS.AES.encrypt(uuidv4(), process.env.INVITE_KEY).toString();
    socket.emit("Invite", { invite_code, time: new Date() });
    socket.on("Join", (r) => {
        // invite_code 解密
        try{
            CryptoJS.AES
                .decrypt(r.invite_code, process.env.INVITE_KEY)
                .toString(CryptoJS.enc.Utf8);
            socket.__client_id = r.id;
            this.context.addSocket(socket, {id: r.id, name: r.name})
            socket.emit("Ack_Invite", { message: "Success connect!", time: new Date() });
        }catch(err){
            socket.disconnect();
        }
    })
    socket.on("disconnect", () => {
        this.context.removeSocket(socket.__client_id)
    });
}

/** */
Handler.prototype.onMessage = function(socket){
    socket.on('__message', r => {
        // 沒有完成註冊程序的,斷線
        if (!socket.hasOwnProperty('__client_id') || !this.context.clientIdExists(socket.__client_id)){
            socket.disconnect();
            return;
        }
        if (r.hasOwnProperty('cmd')) {
            // 正常來說 應該都會進exec, 但不一定會執行到success, 除非有需要回傳值
            dispatcher.exec(r, this.context)
                .then(success => {
                    if (success) socket.emit(success.event, success.data);
                })
                .catch(err => {
                    socket.emit("Ack__message", { cmd: r.cmd, reason: err.reason, time: new Date() });
                })
        }
    })

    // 加入房間
    socket.on('join-room', r => {
        if (r.hasOwnProperty('room-name')) {
            console.log(this.context.joinRoom(socket, r['room-name']));
        }
    });    

    // 移除房間
    socket.on('leave-room', r => {
        if (r.hasOwnProperty('room-name')) {
            console.log(this.context.leaveRoom(socket, r['room-name']));
        }
    });
}





module.exports = Handler;