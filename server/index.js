'use strict';

// Load .env file into process.env
require('dotenv').load();

const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const config = require('./config');

const Database = require('./database');
const Observer = require('./observer');

const api = require('./api');
const proxy = require('./proxy');
const views = require('./views');
const health = require('./health');

// This attempts to send over our devices to Salesforce. It
// does nothing if:
// 1. The data has already been sent to Salesforce
// 2. There are no Salesforce credentials set up in the environment
// Refer to the README to figure out how to set up 2
require('./attempt-salesforce')();

const mqttConfig = {
  host: `mqtt://${config.account.brokerHost}`,
  clientId: config.account.device.mqtt.username,
  username: config.account.device.mqtt.username,
  password: config.account.device.mqtt.password,
  accountId: config.account.accountId
};

const app = express();

const database = new Database({
  databaseURL: config.databaseURL
});
app.set('db', database);

const observer = new Observer(database, mqttConfig);
app.set('observer', observer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

let configLoading = true;
database.selectApplicationConfig(config.account.accountId).then(function(data) {
  const appConfig = data[0];
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
}).catch((error) => {
  console.error(error);
  throw new Error('Can not get application config');
});

// Show "loading" page until Blueprint data has been fetched.
app.use((req, res, next) => {
  if (!configLoading) {
    return next();
  }
  return res.render('loading');
});

// Api routes
app.use('/api', api());

// View routes
app.use('/', views({
  config: config,
}));

// Health checker route
app.use('/diag/selftest', health());

// Proxy route
app.use('/api/proxy', proxy({
  whitelist: [
    'http://www.airnowapi.org/aq/data',
    'https://timeseries.demo.xively.com/api/v4/data/xi/blue/v1',
    'http://concaria-sms.herokuapp.com/api'
  ]
}));

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')));

// Page not found
app.use((req, res) => {
  res.status(404).render('404');
});

// Initialize the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Start server up
const server = app.listen(config.server.port, () => {
  console.log('Node server listening on port', server.address().port);
});

module.exports = server;
