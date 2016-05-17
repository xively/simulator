'use strict'

const deviceConfig = require('../../config/devices')
const database = require('../database')
const rulesEngine = require('../rules')
const cloudinary = require('../util').cloudinary

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

function updateDeviceConfig (req, res) {
  database.updateDeviceConfig(req.query.templateName, req.body)
    .then((rows) => res.json(rows[0]))
}

function getOriginalDeviceConfig (req, res) {
  res.json(deviceConfig[req.query.templateName] || {})
}

function upload (req, res) {
  cloudinary.upload(req.body.deviceImage)
    .then((result) => res.json({ imageUrl: result.secure_url }))
}

module.exports = {
  getFirmwareById,
  updateInventory,
  getRules,
  getRuleById,
  createRule,
  removeRule,
  updateRule,
  updateDeviceConfig,
  getOriginalDeviceConfig,
  upload
}
