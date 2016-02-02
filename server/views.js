'use strict';

var express = require('express');
var path = require('path');
var router = express.Router;

module.exports = function(options) {
  var app = router();

  var config = options.config;

  // Server index page.
  app.get('/', function(req, res) {
    res.render('server-index', config.view);
  });

  // Render the app landing page.
  app.get('/virtual-device', function(req, res) {
    res.render('virtual-device', config.view);
  });

  app.get('/manage', function(req, res) {
    res.render('manage', config.view);
  });

  // Serve up any remaining existing path as requested.
  app.use(express.static(path.join(__dirname, '../public')));

  // Render the app landing page if the requested path isn't found.
  app.get('/virtual-device/*', function(req, res) {
    res.render('virtual-device', config.view);
  });

  app.get('/manage/*', function(req, res) {
    res.render('manage', config.view);
  });

  return app;
};