'use strict'

const RulesEngine = require('./rules')
let rulesEngine

if (!rulesEngine) {
  rulesEngine = new RulesEngine()
}

module.exports = rulesEngine
