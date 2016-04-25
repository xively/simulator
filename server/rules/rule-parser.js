'use strict'

const mqtt = require('mqtt')
const logger = require('winston')
const _ = require('lodash')
const salesforce = require('../salesforce')
const config = require('../../config/server')

class RuleParser {
  constructor (device, rules) {
    this.device = device
    this.rules = rules

    this.channels = new Map()

    this.connectMqtt()
    this.getChannels()
  }

  updateRules (rules) {
    this.rules = rules
  }

  getChannels () {
    this.device.channels.push({
      channelTemplateName: 'log:message',
      channel: `xi/blue/v1/${this.device.accountId}/d/${this.device.id}/_log`,
      persistenceType: 'simple'
    })

    _.each(this.device.channels, (channel) => {
      this.channels.set(channel.channelTemplateName, channel)

      this.mqtt.subscribe(channel.channel)
    })
  }

  connectMqtt () {
    const host = `mqtts://${config.account.brokerHost}:${config.account.brokerPort}`
    const options = {
      username: config.account.brokerUser,
      password: config.account.brokerPassword
    }

    this.mqtt = mqtt.connect(host, options)

    this.mqtt.on('connect', () => {
      logger.silly(`rule parser#mqtt connection success for device ${this.device.id}`)
    })
    this.mqtt.on('error', (error) => {
      logger.debug('rule parser#mqtt connection error', error)
    })
    this.mqtt.on('message', (topic, message) => {
      let channelName = topic.split('/').pop()
      if (channelName === '_log') {
        channelName = 'log:message'
      }

      const channel = this.channels.get(channelName)

      if (!channel) {
        return logger.debug('rule parser#failed to get channel', topic, message)
      }

      channel.latestValue = this.parseMessage(channel.persistenceType, message)
      this.channels.set(channelName, channel)

      this.checkValues(channelName)
    })
  }

  parseMessage (channelType, message) {
    message = message.toString()

    if (channelType !== 'timeSeries') {
      try {
        const parsed = JSON.parse(message)
        return parsed.message || parsed.options || parsed.command
      } catch (ex) { /* ignore */ }
    }

    const fragments = message.split(',')
    return _.trim(fragments[2] || fragments[3] || '', '"').trim()
  }

  checkValues (channelName) {
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

        const sensorValue = this.channels.get(rule.channel.name).latestValue
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
            return rule.value <= sensorValue
          case '$gt':
            return rule.value < sensorValue
          case '$lte':
            return rule.value >= sensorValue
          case '$lt':
            return rule.value > sensorValue
        }
      })
      if (ruleResults[mode](Boolean) && !_.isUndefined(sensorValues[channelName]) && !entry.reported) {
        logger.debug(`rule parser#creating SalesForce ticket for rule ${entry.name}`)
        salesforce.addCases([{
          subject: entry.actions.salesforceCase.value,
          description: 'Test description',
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
