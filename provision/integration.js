'use strict';
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var jsforce = require('jsforce');

function getSalesforceOrgId($) {
  return new jsforce.Connection().login(
    process.env.SALESFORCE_USER,
    process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_TOKEN
  ).then(function(result) {
    $.salesforce = {
      userId: result.id,
      organizationId: result.organizationId
    };

    return $;
  })
    .catch(function(err) {
      console.error('Salesforce Organization ID lookup failed', err);
      throw err;
    });
}

function mapSfOrgToXiAccount($) {
  return request({
    url: 'https://' + $.env.XIVELY_INTEGRATION_HOST + '/api/v1/accounts',
    method: 'POST',
    auth: {
      bearer: $.jwt
    },
    json: {
      id: $.salesforce.organizationId,
      accountId: $.env.XIVELY_ACCOUNT_ID
    }
  })
    .then(function(result) {
      if (result.statusCode !== 201) {
        return Promise.reject({
          message: 'Salesforce Organization mapping failed',
          statusCode: result.statusCode,
          responseBody: result.body
        });
      }

      return $;
    })
    .catch(function(err) {
      console.error('Salesforce Organization mapping failed', err);
      throw err;
    });
}

module.exports = function($) {
  if (!process.env.SALESFORCE_USER) {
    return $;
  }

  return getSalesforceOrgId($)
    .then(mapSfOrgToXiAccount);
};
