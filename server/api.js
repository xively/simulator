'use strict';

var router = require('express').Router;

module.exports = function() {
  var app = router();


  // Firmware credential requests
  app.get('/firmware/:id', function(req, res) {
    var database = req.app.get('db');

    database.selectFirmware(req.params.id)
    .then(function(rows) {
      res.json(rows.length ? rows[0] : []);
    });
  });


  // Inventory update calls
  app.put('/inventory/:verb/:id', function(req, res) {
    var database = req.app.get('db');

    database.updateInventory(req.params.verb, req.params.id)
    .then(function(rows) {
      res.json(rows.length ? rows[0] : []);
    });
  });


  app.get('/rules/', function(req, res) {
    var database = req.app.get('db');

    database.selectRules()
    .then(function(rows) {
      res.json(rows.length ? rows : []);
    });
  });


  app.get('/rules/:id', function(req, res) {
    var database = req.app.get('db');

    database.selectRule(req.params.id)
    .then(function(rows) {
      if (rows.length) {
        res.json(rows[0]);
      }
      else {
        // TODO: Send custom 404 page
        res.status(404).send();
      }
    });
  });


  app.post('/rules/', function(req, res) {
    var database = req.app.get('db');
    var observer = req.app.get('observer');

    database.insertRule(req.body.ruleConfig)
    .then(function(rows) {
      res.json(rows.length ? rows[0] : []);
      observer.resetRules();
    });
  });


  app.delete('/rules/:id', function(req, res) {
    var database = req.app.get('db');
    var observer = req.app.get('observer');

    database.deleteRule(req.params.id)
    .then(function(rows) {
      if (rows.length) {
        res.status(204).send();
        observer.resetRules();
      }
      else {
        // TODO: Send custom 404 page
        res.status(404).send();
      }
    });
  });


  app.put('/rules/:id', function(req, res) {
    var database = req.app.get('db');
    var observer = req.app.get('observer');

    database.updateRule(req.params.id, req.body.ruleConfig)
    .then(function(rows) {
      if (rows.length) {
        res.json(rows[0]);
        observer.resetRules();
      }
      else {
        // TODO: Send custom 404 page
        res.status(404).send();
      }
    });
  });


  return app;
};