'use strict';
var sf = require('jsforce');


var Salesforce = function(options) {
  // If you do authentication here, no need to worry about renewing
  // This constructor function will be run every time new salesforce stuff has to be done
  // The instances of this class will not be used more than once
  this._connection = new sf.Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com'
  });

  this._promise = this._connection.login(options.user, options.pass + options.token);
  this._promise.then(function() {
    console.log(arguments);
  });
  this._promise.catch(function(error) {
    console.log(error);
  });
};


Salesforce.prototype.addCases = function(cases) {
  // Transform data format
  var deviceIdFieldName = process.env.XIVELY_DEVICE_ID_FIELD_NAME || 'XiDeviceId__c';
  var sfCases = cases.map(function(cs) {
    var result = {
      Subject: cs.subject,
      Description: cs.description
      //Contact: {xively__XI_End_User_ID__c: cs.orgId},
      //Asset: {xively__Device_ID__c: cs.deviceId},
      //xively__XI_Device_ID__c: cs.deviceId
    };

    result[deviceIdFieldName] = cs.deviceId;
    return result;
  });

  // Assign intermediate var to hold scope
  var connection = this._connection;

  this._promise.then(function() {
    return connection.sobject('Case').insert(sfCases);
  })
  .then(function(results) {
    results.forEach(function(result, index) {
      if (result.success) {
        console.log('Case Inserted Successfully: %s', sfCases[index].Subject);
      }
    });
  })
  .catch(function(error) {
    console.log(error, sfCases);
  });
};

Salesforce.prototype.addAssets = function(assets) {
  // Transform data format
  var sfAssets = assets.map(function(asset) {
    return {
      Name: asset.product,
      SerialNumber: asset.serial,
      xively__Device_ID__c: asset.deviceId,
      Contact: {xively__XI_End_User_ID__c: asset.orgId},
    };
  });

  // Assign intermediate var to hold scope
  var connection = this._connection;

  this._promise.then(function() {
    return connection.sobject('Asset').upsertBulk(sfAssets, 'xively__Device_ID__c');
  })
  .then(function(results) {
    results.forEach(function(result, index) {
      if (result.success) {
        console.log('Asset Upserted Successfully: %s', sfAssets[index].SerialNumber);
      }
    });
  })
  .catch(function(error) {
    console.log(error, sfAssets);
  });
};


Salesforce.prototype.addContacts = function(contacts) {
  // Transform data format
  var sfContacts = contacts.map(function(contact) {
    return {
      Email: contact.email,
      xively__XI_End_User_ID__c: contact.orgId,
    };
  });

  // Assign intermediate var to hold scope
  var connection = this._connection;
  this._promise.then(function() {
    return connection.sobject('Contact').upsert(sfContacts, 'xively__XI_End_User_ID__c');
  })
  .then(function(results) {
    results.forEach(function(result, index) {
      if (result.success) {
        console.log('Contact Upserted Successfully: %s', sfContacts[index].Email);
      }
    });
  })
  .catch(function(error) {
    console.log(error, sfContacts);
  });
};

Salesforce.prototype.retrieveContact = function(id) {
  var connection = this._connection;
  return this._promise.then(function() {
    return connection.sobject('Contact').retrieve(id);
  });
};

module.exports = Salesforce;
