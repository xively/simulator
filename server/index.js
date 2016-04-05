'use strict';

// Load .env file into process.env
require('dotenv').load();

// This attempts to send over our devices to Salesforce. It
// does nothing if:
// 1. The data has already been sent to Salesforce
// 2. There are no Salesforce credentials set up in the environment
// Refer to the README to figure out how to set up 2
require('./salesforce');

const config = require('./config');
const server = require('./server');

server.listen(config.server.port, () => {
  console.log('Node server listening on port', config.server.port);
});
