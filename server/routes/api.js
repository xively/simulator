'use strict';

function getFirmwareById(req, res) {
  const database = req.app.get('db');

  database.selectFirmware(req.params.id)
  .then(function(rows) {
    res.json(rows.length ? rows[0] : []);
  });
}

function updateInventory(req, res) {
  const database = req.app.get('db');

  database.updateInventory(req.params.verb, req.params.id)
  .then(function(rows) {
    res.json(rows.length ? rows[0] : []);
  });
}

function getRules(req, res) {
  var database = req.app.get('db');

  database.selectRules()
  .then(function(rows) {
    res.json(rows.length ? rows : []);
  });
}

function getRuleById(req, res) {
  var database = req.app.get('db');

  database.selectRule(req.params.id)
  .then(function(rows) {
    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.status(404).send();
    }
  });
}

function createRule(req, res) {
  var database = req.app.get('db');
  var observer = req.app.get('observer');

  database.insertRule(req.body.ruleConfig)
  .then(function(rows) {
    res.json(rows.length ? rows[0] : []);
    observer.resetRules();
  });
}

function removeRule(req, res) {
  var database = req.app.get('db');
  var observer = req.app.get('observer');

  database.deleteRule(req.params.id)
  .then(function(rows) {
    if (rows.length) {
      res.status(204).send();
      observer.resetRules();
    } else {
      res.status(404).send();
    }
  });
}

function updateRule(req, res) {
  var database = req.app.get('db');
  var observer = req.app.get('observer');

  database.updateRule(req.params.id, req.body.ruleConfig)
  .then(function(rows) {
    if (rows.length) {
      res.json(rows[0]);
      observer.resetRules();
    } else {
      res.status(404).send();
    }
  });
}

module.exports = {
  getFirmwareById,
  updateInventory,
  getRules,
  getRuleById,
  createRule,
  removeRule,
  updateRule
};
