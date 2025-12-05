const { io } = require("socket.io-client");

function WSClient(options, onTrigger){
    this.socket = io(options.url, {
        reconnectionDelayMax: 10000,
    });

    // 處理連線 1 收到一個邀請
    this.socket.on("Invite", (...args) => {
        console.log('Recieve cmd Invite ', args)
        this.socket.emit("Join", { id: options.id, name: options.name, invite_code: args[0].invite_code, time: new Date() });
    });

    // 處理連線 2, 到這真正完成連線
    this.socket.on("Ack_Invite", (...args) => {
        console.log(`Join ${options.url} successed`, new Date())
    });

    // 當收到 trigger 指令時
    this.socket.on("__TRIGGER", (...args) => {
	    onTrigger(args)
    })

    this.socket.on('on_rfid', (...args) => {
        console.log(args)
    })
    this.socket.on('on_scale', (...args) => {
        console.log(args)
    })


    // 當收到某個訊息時
    this.socket.on("Ack__message", (...args) => {
        console.log('Ack__message', args[0])
    })

}


export default WSClient;