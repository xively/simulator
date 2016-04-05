'use strict';

const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const config = require('./config');

const database = require('./database');
const Observer = require('./observer');

const routes = require('./routes');
const proxy = require('./proxy');

const mqttConfig = {
  host: `mqtts://${config.account.brokerHost}`,
  clientId: config.account.device.mqtt.username,
  username: config.account.device.mqtt.username,
  password: config.account.device.mqtt.password,
  accountId: config.account.accountId,
};


function registerObserver(app) {
  app.set('observer', new Observer(database, mqttConfig, config.virtualdevice.mqtt.deviceId));
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

let configLoading = true;
if (process.env.NODE_ENV === 'test') {
  configLoading = false;
} else {
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
    registerObserver(app);
    configLoading = false;
  }).catch((error) => {
    console.error(error);
    throw new Error('Can not get application config');
  });
}

// Show "loading" page until Blueprint data has been fetched.
app.use((req, res, next) => {
  if (!configLoading) {
    return next();
  }
  return res.render('loading');
});

// Routes
app.use(routes);

// Proxy route
app.use('/api/proxy', proxy);

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')));

// Page not found
app.use((req, res) => {
  res.status(404).render('404');
});

// Initialize the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


module.exports = app;
