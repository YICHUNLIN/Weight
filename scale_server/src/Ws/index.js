const {Server} = require('socket.io');
const Handler = require('./Handler');

function Ws(server, ctx){
    console.log('socket io is running')
    this.ctx = ctx;
    this.sockets = {};
    this.rooms = {};
    this.registNotifyServices()
    this.io = new Server(server, {
        cors: {
          origin: "*"
        }});
    const handler = new Handler(this);
    this.io.on("connection", (socket) => {
        handler.onConnect(socket)
        handler.onMessage(socket)
    });
}

Ws.prototype.registNotifyServices = function(){
    const {ScaleObserveController, RFIDObserveController} = this.ctx.controller;
    ScaleObserveController.regist("WS-NOTIFY", (err) => {
        Object.values(this.sockets).forEach(s => s.emit('on_scale_err', err))
    }, (data) => {
        Object.values(this.sockets).forEach(s => s.emit('on_scale', data))
    })

    RFIDObserveController.regist("WS-NOTIFY", (err) => {
        Object.values(this.sockets).forEach(s => s.emit('on_rfid_err', err))
    }, (data) => {
        Object.values(this.sockets).forEach(s => s.emit('on_rfid', data))
    })
}

Ws.prototype.clientIdExists = function(id){
    return this.sockets.hasOwnProperty(id);
}

Ws.prototype.addSocket = function(socket, info){
    this.sockets[info.id] = {
        socket,
        name: info.name,
        joinedAt: new Date()
    }
}

Ws.prototype.removeSocket = function(id){
    delete this.sockets[id];
}

Ws.prototype.joinRoom = function(socket, room){
    if (!this.rooms.hasOwnProperty(room)) this.rooms[room] = {};
    socket.join(room);
    this.rooms[room][socket.__client_id] = socket;
    return {result: true, count: Object.keys(this.rooms[room]).length, message: 'successed'}
}


/**
 * 
 * @param {*} socket 
 * @param {*} room 
 * rooms = {
 *  room1: {
 *      socketId: socket1,...
 *  },
 *  room2: {
 *  }
 * }
 * 
 * @returns 
 */
Ws.prototype.leaveRoom = function(socket, room){
    if (!this.rooms.hasOwnProperty(room)) return {result: false, message: "failed, not found room"}
    if (!this.room[room][socket.__client_id]) return {result: false, message: "failed, not found socket"}
    delete this.room[room][socket.__client_id];
}

Ws.prototype.mid = function(){
    const tthis = this;
    return function(req, res, next) {
        res.locals.ws = tthis;
        return next();
    }
}

module.exports = Ws;