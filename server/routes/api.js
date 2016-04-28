'use strict'

const database = require('../database')
const rulesEngine = require('../rules')

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
  database.insertRule(req.body)
    .then((rows) => {
      res.json(rows.length ? rows[0] : [])
      rulesEngine.updateRules()
    })
}

function removeRule (req, res) {
  database.deleteRule(req.params.id)
    .then((rows) => {
      if (rows.length) {
        res.status(204).send()
        rulesEngine.updateRules()
      } else {
        res.status(404).send()
      }
    })
}

function updateRule (req, res) {
  database.updateRule(req.params.id, req.body)
    .then((rows) => {
      if (rows.length) {
        res.json(rows[0])
        rulesEngine.updateRules()
      } else {
        res.status(404).send()
      }
    })
}

function getDeviceConfig (req, res) {
  database.selectDeviceConfig()
    .then((rows) => res.json(rows[0]))
}

function updateDeviceConfig (req, res) {
  database.updateDeviceConfig(req.body)
    .then((rows) => res.json(rows[0]))
}

module.exports = {
  getFirmwareById,
  updateInventory,
  getRules,
  getRuleById,
  createRule,
  removeRule,
  updateRule,
  getDeviceConfig,
  updateDeviceConfig
}
