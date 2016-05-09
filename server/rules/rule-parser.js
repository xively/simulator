'use strict'

const logger = require('winston')
const _ = require('lodash')
const mqtt = require('mqtt')
const config = require('../../config/server')
const salesforce = require('../salesforce')

class RuleParser {
  constructor (device, rules) {
    this.device = device
    this.rules = rules
    this.channels = new Map()

    this.mqtt = mqtt.connect(`mqtts://${config.account.brokerHost}:${config.account.brokerPort}`, {
      username: config.account.brokerUser,
      password: config.account.brokerPassword,
      rejectUnauthorized: false
    })

    this.subscribe()

    this.mqtt.on('connect', () => {
      logger.silly(`RuleParser#connect: mqtt connections success for device ${this.device.id}`)
    })

    this.mqtt.on('error', (error) => {
      logger.debug('RuleParser#error: mqtt connection error', error.message)
    })

    this.mqtt.on('message', (topic, message) => {
      let channelName = topic.split('/').pop()
      message = message.toString()
      if (channelName === '_log') {
        channelName = 'log:message'
      }

      const channel = this.channels.get(channelName)
      if (!channel) {
        return logger.debug('RuleParser#message: failed to get channel', channelName)
      }

      channel.latestValue = this.parseMessage(channel.persistenceType, message)
      this.channels.set(channelName, channel)
      this.checkValues(channelName, message)
    })
  }

  subscribe () {
    this.device.channels.concat({
      channelTemplateName: 'log:message',
      channel: `xi/blue/v1/${this.device.accountId}/d/${this.device.id}/_log`,
      persistenceType: 'simple'
    }).forEach((channel) => {
      this.channels.set(channel.channelTemplateName, channel)
      this.mqtt.subscribe(channel.channel)
    })
  }

  unsubscribe () {
    this.channels.forEach((channel) => {
      this.mqtt.unsubscribe(channel.channel)
    })
  }

  updateRules (rules) {
    this.rules = rules
  }

  update (device, rules) {
    this.device = device
    this.rules = rules
    this.subscribe()
  }

  parseMessage (channelType, message) {
    if (channelType !== 'timeSeries') {
      try {
        const parsed = JSON.parse(message)
        return parsed.message || parsed.options || parsed.command
      } catch (ex) { /* ignore */ }
    }

    const fragments = message.split(',')
    return _.trim(fragments[2] || fragments[3] || '', '"').trim()
  }

  checkValues (channelName, message) {
    this.rules.forEach((entry) => {
      const mode = entry.conditions.mode === 'all' ? 'every' : 'some'
      const sensorValues = {}
      const ruleResults = entry.conditions.rules.map((rule) => {
        if (!rule.template) {
          return true
        }
        if (rule.template.id !== this.device.deviceTemplateId) {
          return false
        }

        const channel = this.channels.get(rule.channel.name)
        if (!channel) {
          return false
        }

        const sensorValue = channel.latestValue
        sensorValues[rule.channel.name] = sensorValue

        switch (rule.operator) {
          case '$in':
            return sensorValue && new RegExp(rule.value, 'i').test(sensorValue)
          case '$nin':
            return sensorValue && !new RegExp(rule.value, 'i').test(sensorValue)
          case '$eq':
            return rule.value === sensorValue
          case '$ne':
            return rule.value !== sensorValue
          case '$gte':
            return parseFloat(rule.value) <= parseFloat(sensorValue)
          case '$gt':
            return parseFloat(rule.value) < parseFloat(sensorValue)
          case '$lte':
            return parseFloat(rule.value) >= parseFloat(sensorValue)
          case '$lt':
            return parseFloat(rule.value) > parseFloat(sensorValue)
        }
      })

      if (ruleResults[mode](Boolean) && !_.isUndefined(sensorValues[channelName]) && !entry.reported) {
        logger.debug(`RuleParser#checkValues: creating SalesForce ticket for rule ${entry.name} because of message: ${message}`)
        salesforce.addCases([{
          subject: entry.actions.salesforceCase.value,
          description: message,
          deviceId: this.device.id,
          orgId: this.device.organizationId
        }])
          .then(() => {
            entry.reported = true
          })
      }
    })
  }
}

module.exports = RuleParser
