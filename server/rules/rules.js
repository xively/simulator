'use strict'

const logger = require('winston')
const db = require('../database')
const config = require('../../config/server')
const RuleParser = require('./rule-parser')

class RulesEngine {
  constructor () {
    this.ruleParsers = new Map()
    this.disabled = config.habanero.embedded || process.env.NODE_ENV === 'test'

    if (this.disabled) {
      logger.debug('RulesEngine is disabled')
    }
  }

  getRules () {
    return db.selectRules().then((rules) => rules.map((rule) => rule.ruleConfig))
  }

  updateRules () {
    if (this.disabled) {
      return
    }

    this.getRules().then((rules) => {
      this.ruleParsers.forEach((ruleParser) => ruleParser.updateRules(rules))
    })
  }

  update (devices) {
    if (this.disabled) {
      return
    }

    this.getRules().then((rules) => {
      devices.forEach((device) => {
        let ruleParser = this.ruleParsers.get(device.id)
        if (ruleParser) {
          ruleParser.update(device, rules)
          return
        }

        ruleParser = new RuleParser(device, rules)
        this.ruleParsers.set(device.id, ruleParser)
      })
    })
    .catch((error) => {
      logger.error('RulesEngine#update: error', error)
    })
  }
}

module.exports = RulesEngine
