require('dotenv').config()
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
const cors = require('cors');
const Auth = require('./utils/auth')
const MContext = require('./context');
const context = new MContext();
const objectServer = require('./utils/ObjectServer')({
    clientId: process.env.selfAuthServer_clientId, 
    secret: process.env.selfAuthServer_secret,
    url: process.env.auth_server,
    selfAuthServerUserAccount: process.env.selfAuthServerUserAccount,
    selfAuthServerUserPassword: process.env.selfAuthServerUserPassword
})

var app = express();

app.use(cookieParser());
app.use(logger('dev'));
require('./utils/passport')(passport, objectServer);

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
module.exports = app;