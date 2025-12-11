require('dotenv').config()
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
const cors = require('cors');
const Auth = require('./utils/auth')
const MContext = require('./context');
const context = new MContext();
const {Config} = context.models;
const {ScaleObserveController} = context.controller;

//const WS = require('./Ws');
ScaleObserveController.start(() => { console.log(`ScaleObserveController is opening...`)});
//RFIDObserveController.start();
const objectServer = require('./utils/ObjectServer')({
    clientId: Config.getConfig("AUTH_CLIENT_ID").value, 
    secret: Config.getConfig("AUTH_CLIENT_SECRET").value,
    url: Config.getConfig("AUTH_SERVER").value,
    selfAuthServerUserAccount: Config.getConfig("AUTH_CLIENT_USER_ACCOUNT").value,
    selfAuthServerUserPassword: Config.getConfig("AUTH_CLIENT_USER_PASSWORD").value
})
console.log("AUTH SERVER=",Config.getConfig("AUTH_SERVER").value)
console.log("AUTH ACCOUNT=",Config.getConfig("AUTH_CLIENT_USER_ACCOUNT").value)

var app = express();

app.set('port', process.env.PORT);

var server = http.createServer(app);
//const ws = new WS(server, context);
app.use(cookieParser());
app.use(logger('dev'));
require('./utils/passport')(passport, objectServer);
//app.use(ws.mid())

const auth = new Auth();
app.use(function(req, res, next) {
    req.auth = auth;
    req.objectServer = objectServer;
    next();
}, (req, res, next) => {
    next();
});

require('./loadApi')(context, app, [
      cors(),
      express.json(), 
      express.urlencoded({ extended: false }), 
      (req, res, next) => {
          next();
      }
]);



/** Server Listening*/

server.listen(process.env.PORT);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof process.env.PORT === 'string'
    ? 'Pipe ' + process.env.PORT
    : 'Port ' + process.env.PORT;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      process.exit(1);
      break;
    case 'EADDRINUSE':
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}