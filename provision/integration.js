'use strict';
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var jsforce = require('jsforce');

module.exports = function ($) {
  return getSalesforceOrgId($)
    .then(mapSfOrgToXiAccount)
    .then(function($) {
      return $;
    });
};

function getSalesforceOrgId($) {
  return new jsforce.Connection().login(process.env.SALESFORCE_USER, process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_TOKEN).then(function (result) {
    $.salesforce = {
      userId: result.id,
      organizationId: result.organizationId
    };

    return $;
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
    .then(function (result) {
      if (result.statusCode !== 201) {
        return Promise.reject({
          message: 'Salesforce Organization mapping failed',
          statusCode: result.statusCode,
          responseBody: result.body
        });
      }

      return $;
    });
}