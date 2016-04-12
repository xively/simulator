'use strict'

const database = require('../database')

function getFirmwareById (req, res) {
  database.selectFirmware(req.params.id)
    .then((rows) => res.json(rows.length ? rows[0] : []))
}

function updateInventory (req, res) {
  database.updateInventory(req.params.verb, req.params.id)
    .then((rows) => res.json(rows.length ? rows[0] : []))
}

function getRules (req, res) {
  database.selectRules()
    .then((rows) => res.json(rows.length ? rows : []))
}

function getRuleById (req, res) {
  database.selectRule(req.params.id)
    .then((rows) => {
      if (rows.length) {
        res.json(rows[0])
      } else {
        res.status(404).send()
      }
    })
}

function createRule (req, res) {
  var observer = req.app.get('observer')

  database.insertRule(req.body)
    .then((rows) => {
      res.json(rows.length ? rows[0] : [])
      observer.resetRules()
    })
}

function removeRule (req, res) {
  var observer = req.app.get('observer')

  database.deleteRule(req.params.id)
    .then((rows) => {
      if (rows.length) {
        res.status(204).send()
        observer.resetRules()
      } else {
        res.status(404).send()
      }
    })
}

function updateRule (req, res) {
  var observer = req.app.get('observer')

  database.updateRule(req.params.id, req.body.ruleConfig)
    .then((rows) => {
      if (rows.length) {
        res.json(rows[0])
        observer.resetRules()
      } else {
        res.status(404).send()
      }
    })
}

module.exports = {
  getFirmwareById,
  updateInventory,
  getRules,
  getRuleById,
  createRule,
  removeRule,
  updateRule
}
