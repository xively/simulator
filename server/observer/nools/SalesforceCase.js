'use strict';

var Salesforce = require('../../vendor/salesforce');

var creds = {
  user: process.env.SALESFORCE_USER,
  pass: process.env.SALESFORCE_PASSWORD,
  token: process.env.SALESFORCE_TOKEN,
};


var salesforceEnabled = (
  typeof creds.user !== 'undefined' &&
  typeof creds.pass !== 'undefined' &&
  typeof creds.token !== 'undefined'
);

// Create a new Salesforce client. This also attempts to connect immediately.
// The current API of the salesforce wrapper requires that we catch connection
// errors in subsequent method calls.
var salesforce;
if (salesforceEnabled) {
  salesforce = new Salesforce(creds);
}

var SalesforceCase = function(AirSoClean3000, caseTitle) {
  this.caseTitle = caseTitle;
  // Eventually will take in message type
  if (salesforceEnabled) {
    salesforce.addCases([{
      subject: caseTitle,
      description: JSON.stringify(AirSoClean3000.deviceValues),
      deviceId: AirSoClean3000.deviceId,
      orgId: process.env.XIVELY_SAMPLE_ORG_ID
    }]);
  }
};

module.exports = SalesforceCase;
