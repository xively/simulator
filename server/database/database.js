'use strict';

const fs = require('fs');
const createKnex = require('knex');
const moment = require('moment');
const config = require('../config');

const knex = createKnex({
  client: 'pg',
  connection: config.database.pgUri,
  debug: Boolean(process.env.KNEX_DEBUG)
});

// Application
function selectApplicationConfig(accountId) {
  return knex('application_config')
    .select()
    .where('accountId', accountId);
}

function insertApplicationConfig(data) {
  return knex('application_config')
    .insert(data)
    .returning('*');
}

// Firmware
function selectFirmwares() {
  return knex('firmware')
    .select();
}

function selectFirmware(deviceId) {
  return knex('firmware')
    .select()
    .where('deviceId', deviceId)
    .limit(1);
}

function insertFirmware(data) {
  return knex('firmware')
    .insert(data)
    .returning('*');
}

// Rule
function selectRules() {
  return knex('rules')
    .select();
}

function selectRule(id) {
  return knex('rules')
    .select()
    .where('id', id);
}

function insertRule(ruleConfig) {
  return knex('rules')
    .insert(ruleConfig)
    .returning('*');
}

function updateRule(id, ruleConfig) {
  const updateQuery = {
    ruleConfig: JSON.stringify(ruleConfig)
  };
  return knex('rules')
    .where('id', id)
    .update(updateQuery)
    .returning('*');
}

function deleteRule(id) {
  return knex('rules')
    .where('id', id)
    .del()
    .returning('*');
}

// Inventory
function insertInventory(data) {
  return knex('inventory')
    .insert(data)
    .returning('*');
}

function updateInventory(verb, inventoryId) {
  const updateQuery = {};
  if (verb === 'sell') {
    updateQuery.sold = true;
    updateQuery.soldDate = moment.utc().toDate();
  } else if (verb === 'reserve') {
    updateQuery.reserved = true;
  } else {
    throw new Error(`Tried to ${verb} the inventory`);
  }

  return knex('inventory')
    .where('id', inventoryId)
    .update(updateQuery)
    .returning('*');
}

// Misc
function runScriptFile(fileName) {
  var script = fs.readFileSync(fileName, 'utf8');

  return knex.raw(script);
}

function truncateTables() {
  return Promise.all([
    knex('firmware').del(),
    knex('inventory').del(),
    knex('rules').del(),
    knex('application_config').del()
  ]);
}

module.exports = {
  selectApplicationConfig,
  insertApplicationConfig,

  selectFirmwares,
  selectFirmware,
  insertFirmware,

  selectRules,
  selectRule,
  insertRule,
  updateRule,
  deleteRule,

  insertInventory,
  updateInventory,

  runScriptFile,
  truncateTables
};
