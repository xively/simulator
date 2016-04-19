'use strict'

const Salesforce = require('./salesforce')
let salesforce

if (!salesforce) {
  salesforce = new Salesforce()
}

module.exports = salesforce
