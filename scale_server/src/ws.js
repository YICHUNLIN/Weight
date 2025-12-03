
const { Server } = require('socket.io');
function Ws(server){
    console.log('=== Socket Server Init Start ===')
    this.io = new Server(server);
    this.init();
    console.log('=== Socket Server Init Snd ===')
}

Ws.prototype.init = function(){
    this.io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
            this.io.emit('chat message', msg);
        });
    });
}


module.exports = function(server){
    return new Ws(server);
}