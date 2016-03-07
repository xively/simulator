'use strict';
// Load environment vars and .env file into process.env.
require('dotenv').load();

var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var _ = require('lodash');

var config = require('./config');

// This attempts to send over our devices to Salesforce. It
// does nothing if:
// 1. The data has already been sent to Salesforce
// 2. There are no Salesforce credentials set up in the environment
// Refer to the README to figure out how to set up 2
var attemptSalesforce = require('./attempt-salesforce');
attemptSalesforce();

var mqttConfig = {
  host: `mqtt://${config.account.brokerHost}`,
  clientId: config.account.device.mqtt.username,
  username: config.account.device.mqtt.username,
  password: config.account.device.mqtt.password,
  accountId: config.account.accountId
};

var app = express();
app.set('port', process.env.PORT || 5000);

var Database = require('./database');
var database = new Database({
  databaseURL: process.env.DATABASE_URL
});
app.set('db', database);

var Observer = require('./observer');
var observer = new Observer(database, mqttConfig);
app.set('observer', observer);

var parsers = express();
parsers.use(bodyParser.json());
parsers.use(bodyParser.urlencoded({
  extended: false
}));
parsers.use(cookieParser());

var configLoading = true;
database.selectApplicationConfig(config.account.accountId).then(function(data) {
  var appConfig = data[0];
  _.merge(config, {
    account: {
      organizationId: appConfig.organization.id,
      user: {
        username: appConfig.endUser.id,
        password: appConfig.mqttUser.secret
      },
      device: {
        id: appConfig.device.id,
        accountId: appConfig.device.accountId
      }
    },
    virtualdevice: {
      mqtt: {
        deviceId: appConfig.device.id
      }
    }
  });

  configLoading = false;
}).catch(function(error) {
  console.log(error);
});

// Show "loading" page until Blueprint data has been fetched.
app.use(function(req, res, next) {
  if (!configLoading) {
    return next();
  }
  return res.render('loading');
});

// Api routes
var api = require('./api');
app.use('/api', parsers, api());

// View routes
var views = require('./views');
app.use('/', views({
  config: config,
}));

// Health checker route
var health = require('./health');
app.use('/diag/selftest', parsers, health());

// Proxy route
var proxy = require('./proxy');
app.use('/api/proxy', parsers, proxy({
  whitelist: [
    'http://www.airnowapi.org/aq/data',
    'https://timeseries.demo.xively.com/api/v4/data/xi/blue/v1',
    'http://concaria-sms.herokuapp.com/api'
  ]
}));

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')));

// Page not found.
app.use(function(req, res) {
  res.status(404).render('404');
});

// Initialize the view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Start server up
var server = app.listen(app.get('port'), function() {
  console.log('Node server listening on port', server.address().port);
});
