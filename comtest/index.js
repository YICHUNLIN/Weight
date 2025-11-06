const { SerialPort } = require('serialport')

// tty.usbserial-1220
// tty.usbserial-1230

const port = new SerialPort({ 
    path: '/dev/tty.usbserial-1130', 
    baudRate: 9600
});

port.on('data', function (data) {
    console.log(data); // Convert buffer to string for display
});
