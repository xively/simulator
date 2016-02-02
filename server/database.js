'use strict';

var url = require('url');
var Promise = require('bluebird');
var fs = require('fs');
var pg = require('pg-promise')({
  promiseLib: Promise,
});


function Database(options) {
  // TODO: Maybe deal with options in a cleaner way.
  var databaseAddress = url.parse(options.databaseURL);
  var databaseAuth = databaseAddress.auth.split(':');
  var pgOptions = {
    user: databaseAuth[0],
    password: databaseAuth[1],
    host: databaseAddress.hostname,
    port: databaseAddress.port,
    database: databaseAddress.path.slice(1),
    ssl: true,
    connect: function() {
      console.log('Connected to Postgres');
    },
  };

  this._client = pg(pgOptions);
  this.connectedClient = this._client.connect();
  this.connectedClient.catch(function(error) {
    console.log(error);
  });
}

Database.prototype._query = function(query, data) {
  var client = this._client;
  return this.connectedClient.then(function() {
    return client.query(query, data);
  });
};

Database.prototype._insertQuery = function(tableName, columnNames, rowData) {
  var fields = [];
  var values = [];
  // Loop through the list of expected column names
  columnNames.forEach(function(field, key) {
    // The format for psql prepared statements is $1, $2 for ['a', 'b'] - this adds to array of placeholders
    fields.push('$' + (key + 1));
    // This checks to see if the data we're assuming is there is actually present
    if (typeof rowData[field] !== 'undefined') {
      values.push(rowData[field]);
    }
    else {
      throw new Error('Missing field: ' + field);
    }
  });

  // Puts together lists of column names and placeholders
  var columnList = columnNames.join('","');
  var fieldList = fields.join(', ');

  return this._query(
    'INSERT INTO ' + tableName + ' ("' + columnList + '") VALUES (' + fieldList + ') RETURNING *',
    values
    );
};

Database.prototype.end = function() {
  // shutting down the library, not just one database connection:
   pg.end(); // nothing to return here;
};

Database.prototype.runScriptFile = function(fileName) {
  var script = fs.readFileSync(fileName, 'utf8');

  return this._query(script);
};


// Inventory
Database.prototype.insertInventory = function(data) {
  var columns = ['serial'];

  return this._insertQuery('inventory', columns, data);
};

Database.prototype.updateInventory = function(verb, inventoryId) {
  var query = 'UPDATE inventory ';
  switch (verb) {
    case 'sell':
      query += 'SET "sold" = true, "soldDate" = now()::timestamp';
      break;

    case 'reserve':
      query += 'SET "reserved" = true';
      break;

    default:
      throw new Error('Tried to ' + verb + ' the inventory');
  }
  query += ' WHERE id = $1 RETURNING *';

  return this._query(query, inventoryId);
};

Database.prototype.selectInventory = function() {};

// Firmware
Database.prototype.insertFirmware = function(data) {
  var columns = [
    'id',
    'serial',
    'mqttUser',
    'mqttPassword',
    'associationCode',
    'organizationId',
    'deviceId',
  ];

  return this._insertQuery('firmware', columns, data);
};

Database.prototype.selectFirmwares = function() {
  return this._query('SELECT * FROM firmware');
};

Database.prototype.selectFirmware = function(deviceId) {
  return this._query('SELECT * FROM firmware WHERE "deviceId" = $1 LIMIT 1', [deviceId]);
};

// Rules
Database.prototype.insertRule = function(ruleConfig) {
  var columns = ['ruleConfig'];
  return this._insertQuery('rules', columns, {ruleConfig: JSON.stringify(ruleConfig)});
};

Database.prototype.updateRule = function(id, ruleConfig) {
  var query = 'UPDATE rules SET "ruleConfig" = $1 WHERE id = $2 RETURNING *';

  return this._query(query, [JSON.stringify(ruleConfig), id]);
};

Database.prototype.selectRules = function() {
  return this._query('SELECT * FROM rules');
};

Database.prototype.selectRule = function(id) {
  return this._query('SELECT * FROM rules WHERE id = $1', id);
};

Database.prototype.deleteRule = function(id) {
  return this._query('DELETE FROM rules WHERE id = $1 RETURNING *', id);
};

module.exports = Database;