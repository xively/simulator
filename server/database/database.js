'use strict'

const fs = require('fs')
const createKnex = require('knex')
const config = require('../../config/server')

const knex = createKnex({
  client: 'pg',
  connection: config.database.pgUri,
  debug: Boolean(process.env.KNEX_DEBUG)
})

// Application
function selectApplicationConfig (accountId) {
  return knex('application_config')
    .select()
    .where('accountId', accountId)
}

function insertApplicationConfig (data) {
  return knex('application_config')
    .insert(data)
    .returning('*')
}

// Device config
function createDeviceConfig (data) {
  return knex('device_config')
    .insert(data)
    .returning('*')
}

function selectDeviceConfigs () {
  return knex('device_config')
    .select()
}

function selectDeviceConfigsAsObject () {
  return selectDeviceConfigs()
    .then((data) => {
      return data.reduce((prev, current) => {
        prev[current.templateName] = current.config
        return prev
      }, {})
    })
}

function selectDeviceConfig (templateName) {
  return knex('device_config')
    .select()
    .where('templateName', templateName)
}

function updateDeviceConfig (templateName, config) {
  const resp = knex('device_config')
    .where('templateName', templateName)
    .update({ config })
    .returning('*')

  return resp.length ? resp : createDeviceConfig({ templateName, config })
}

// Firmware
function selectFirmwares () {
  return knex('firmware')
    .select()
}

function selectFirmware (deviceId) {
  return knex('firmware')
    .select()
    .where('deviceId', deviceId)
    .limit(1)
}

function insertFirmware (data) {
  return knex('firmware')
    .insert(data)
    .returning('*')
}

// Rule
function selectRules () {
  return knex('rules')
    .select()
}

function selectRule (id) {
  return knex('rules')
    .select()
    .where('id', id)
}

function insertRule (ruleConfig) {
  return knex('rules')
    .insert({ ruleConfig })
    .returning('*')
}

function updateRule (id, ruleConfig) {
  return knex('rules')
    .where('id', id)
    .update({ ruleConfig })
    .returning('*')
}

function deleteRule (id) {
  return knex('rules')
    .where('id', id)
    .del()
    .returning('*')
}

// Image
function insertImage (image) {
  return knex('images')
    .insert({ image })
    .returning('*')
}

function selectImage (imageId) {
  return knex('images')
    .where('id', imageId)
    .returning('*')
}

// Misc
function runScriptFile (fileName) {
  var script = fs.readFileSync(fileName, 'utf8')

  return knex.raw(script)
}

function truncateTables () {
  return Promise.all([
    knex('firmware').del(),
    knex('rules').del(),
    knex('application_config').del(),
    knex('device_config').del()
  ])
}

module.exports = {
  selectApplicationConfig,
  insertApplicationConfig,

  createDeviceConfig,
  selectDeviceConfigs,
  selectDeviceConfigsAsObject,
  selectDeviceConfig,
  updateDeviceConfig,

  selectFirmwares,
  selectFirmware,
  insertFirmware,

  selectRules,
  selectRule,
  insertRule,
  updateRule,
  deleteRule,

  insertImage,
  selectImage,

  runScriptFile,
  truncateTables
}
