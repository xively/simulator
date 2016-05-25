'use strict'

const deviceConfig = require('../../config/devices')
const database = require('../database')
const rulesEngine = require('../rules')

function getFirmwareById (req, res) {
  database.selectFirmware(req.params.id)
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

function getImageById (req, res) {
  database.selectImage(req.params.id)
    .then((result) => {
      res.set('Content-Type', 'image/*')
      res.send(result[0].image)
    })
    .catch(() => {
      res.status(404).end()
    })
}

function uploadImage (req, res) {
  database.insertImage(req.file.buffer)
    .then((result) => res.json({ imageUrl: `/api/images/${result[0].id}` }))
}

module.exports = {
  getFirmwareById,
  getRules,
  getRuleById,
  createRule,
  removeRule,
  updateRule,
  updateDeviceConfig,
  getOriginalDeviceConfig,
  getImageById,
  uploadImage
}
