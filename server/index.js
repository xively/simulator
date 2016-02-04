'use strict';

var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var _ = require('lodash');

// Load environment vars and .env file into process.env.
require('dotenv').load();

// This attempts to send over our devices to Salesforce. It
// does nothing if:
// 1. The data has already been sent to Salesforce
// 2. There are no Salesforce credentials set up in the environment
// Refer to the README to figure out how to set up 2
var attemptSalesforce = require('./attempt-salesforce');
attemptSalesforce();

var config = {raw: null, view: null};

var mqttConfig = {
  host: 'mqtt://' + process.env.XIVELY_BROKER_HOST,
  clientId: process.env.XIVELY_ACCOUNT_BROKER_USER,
  username: process.env.XIVELY_ACCOUNT_BROKER_USER,
  password: process.env.XIVELY_ACCOUNT_BROKER_PASSWORD,
  accountId: process.env.XIVELY_ACCOUNT_ID,
};


var app = express();
app.set('port', process.env.PORT || 5000);


var Database = require('./database');
var database = new Database({databaseURL: process.env.DATABASE_URL});
app.set('db', database);


var Observer = require('./observer');
var observer = new Observer(database, mqttConfig);
app.set('observer', observer);


var parsers = express();
parsers.use(bodyParser.json());
parsers.use(bodyParser.urlencoded({extended: false}));
parsers.use(cookieParser());

database.selectApplicationConfig(process.env.XIVELY_ACCOUNT_ID).then(function(data) {
  var envData = {
    env: {}
  };
  // Augment data object with NODE_ENV value.
  envData.env.NODE_ENV = process.env.NODE_ENV;
  envData.organization = data.organization;
  envData.mqttUser = data.mqttUser;

  config.raw = require('./config').load({
    env: envData,
    files: ['meta.json', 'account.json', 'virtualdevice.json'],
  });
  console.log('config', JSON.stringify(config, null, 2));
  // Allow config to be referenced by name inside of views.
  // This creates a new object that has everything in config plus an
  // additional property "config" that is a circular reference
  config.view = _.merge({}, config.raw, {config: config.raw});
  console.log('Provisioning data loaded.');
});


// Show "loading" page until Blueprint data has been fetched.
app.use(function(req, res, next) {
  if (config.view) {
    return next();
  }
  res.render('loading');
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
  ],
}));


// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')));


// Page not found.
app.use(function(req, res) {
  res.status(404).render('404', config.view);
});


// Initialize the view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Start server up
var server = app.listen(app.get('port'), function() {
  console.log('Node server listening on port', server.address().port);
});