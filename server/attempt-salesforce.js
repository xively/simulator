/* eslint no-process-exit: 0 */

'use strict';

// This file attempts to create and/or update data in Salesforce. It updates
// the:
// 1. all of the devices made during provisioning
// 2. a contact (someone who is notified when Rules are triggered)
//
// To opt in, the user must have input their Salesforce credentials at the time
// that the app has started.
//
// There are two ways to register your Salesforce credentials.
// 1. Locally, update your `.env` file with SALESFORCE_USER, SALESFORCE_PASSWORD,
//    and SALESFORCE_TOKEN
// 2. NOT TESTED: On Heroku, go to the Dashboard for this application, and edit the
//    Environment variables. Then, restart the app.
//
// Note: you also need to install the Salesforce plugin to your Salesforce account
// by navigating to this link:
// https://login.salesforce.com/packaging/installPackage.apexp?p0=04t36000000HRMn

// This is a wrapper client for Salesforce. It wraps the Salesforce JavaScript
// API, JSForce, that is documented here:
// https://jsforce.github.io/
var Salesforce = require('./vendor/salesforce');
var request = require('request');

// One of the goals for this file is to send our device list over to Salesforce
// We use the BlueprintClient to do retrieve the devices that we then send
// to Salesforce
var BlueprintClient = require('./vendor/blueprint-client-node');

module.exports = function() {
  // Attempt to retrieve the Salesforce credentials from the environment.
  // The credentials always come from the environment, whether the developer
  // is running this locally or on Heroku
  var creds = {
    user: process.env.SALESFORCE_USER,
    pass: process.env.SALESFORCE_PASSWORD,
    token: process.env.SALESFORCE_TOKEN,
  };

  // If we have no credentials, then no worries. The user isn't required
  // to hook the application up with Salesforce, so we just return.
  if (!creds.user || !creds.pass || !creds.token) {
    console.warn('Skipping Salesforce provisioning. To set up this application with Salesforce, follow the instructions in the README.');
    return;
  }

  // Create a new Salesforce client. This also attempts to connect immediately.
  // The current API of the salesforce wrapper requires that we catch connection
  // errors in subsequent method calls.
  var salesforce = new Salesforce(creds);

  // The first part of setting things up in Salesforce is to register the
  // contact we pull from the environment.
  // This is provisioned information that we use as our Salesforce contact.
  // The organizationId is the one that is associated with the 50 devices.
  // The email is the address that will be contacted when a Rule is configured
  // to send an email.
  // Because Salesforce requests that your username be an email, we assume that
  // you followed those instructions
  // This will never duplicate the contact, since the `orgId` remains the same
  // for each call, and `upsert` is used under the hood. Therefore, if it already
  // exists it just gets updated.
  console.log('Creating (or updating) the Salesforce contact.');
  salesforce.addContacts([{
    email: process.env.SALESFORCE_USER,
    orgId: process.env.XIVELY_SAMPLE_ORG_ID,
  }]);

  // We need to make a request to the demo API to log in. This will give us
  // back the `jwt`, which is a token we need to fetch the 50 devices.
  var postData = {
    emailAddress: process.env.XIVELY_ACCOUNT_USER_NAME,
    password: process.env.XIVELY_ACCOUNT_USER_PASSWORD,
    accountId: process.env.XIVELY_ACCOUNT_ID,
  };

  request.post({
    url: 'https://' + process.env.XIVELY_IDM_HOST + '/api/v1/auth/login-user',
    form: postData
  }, function(err, httpResponse, body) {
    if (err) {
      console.error('We could not authenticate you with the Xively server; Salesforce will not be provisioned.');
      return;
    }
    try {
      body = JSON.parse(body);
    }
    catch (e) {
      console.error('The Xively server returned a malformed response; Salesforce will not be provisioned.');
    }
    var jwt = body.jwt;

    // Once the request has returned, we get our JWT back. We then use
    // this to connect to Blueprint, which downloads our API endpoints from
    // Swagger (this happens automatically when you `new` it up)
    // After that, we make a request for all 50 of our devices.
    // Then, finally, we post to Salesforce and hope that all 50 requests are
    // processed
    var client = new BlueprintClient({
      authorization: 'Bearer ' + jwt,
      docsUrl: 'https://' + process.env.XIVELY_BLUEPRINT_HOST + '/docs',
    });

    client.ready.then(function(c) {
      c.setAccountId(postData.accountId);
      c.apis.devices.all({
        // This ensures that we get all of the devices
        pageSize: 100,
      })
        .then(function(res) {
          var data, deviceList;
          try {
            data = JSON.parse(res.data.toString());
            // Transforms the data into the format that the
            // Salesforce JS client expects.
            deviceList = data.devices.results.map(function(d) {
              return {
                product: d.name,
                serial: d.serialNumber,
                deviceId: d.id,
                orgId: d.organizationId,
              };
            });

            console.log('Adding the 50 devices to Salesforce.');
            salesforce.addAssets(deviceList);
          }
          catch (e) {
            console.error('Blueprint returned malformed JSON; Salesforce will not be provisioned.');
          }
        })
        .catch(function(e) {
          console.error('Blueprint failed to return the devices; Salesforce will not be provisioned.');
        });
    });
  });
};
