require('dotenv').config()
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
const cors = require('cors');
const Auth = require('./utils/auth')
const MContext = require('./context');
const context = new MContext();
const {Config} = context.models;
const objectServer = require('./utils/ObjectServer')({
    clientId: Config.getConfig("AUTH_CLIENT_ID").value, 
    secret: Config.getConfig("AUTH_CLIENT_SECRET").value,
    url: Config.getConfig("AUTH_SERVER").value,
    selfAuthServerUserAccount: Config.getConfig("AUTH_CLIENT_USER_ACCOUNT").value,
    selfAuthServerUserPassword: Config.getConfig("AUTH_CLIENT_USER_PASSWORD").value
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