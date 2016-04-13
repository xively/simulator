'use strict'

const path = require('path')
const logger = require('winston')
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon')

const config = require('../config/server')
const devicesConfig = require('../config/devices')

const database = require('./database')
// const Observer = require('./observer')

const routes = require('./routes')
const proxy = require('./proxy')

const app = express()

// const observer = new Observer()
// app.set('observer', observer)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())

let configLoading = true
if (process.env.NODE_ENV === 'test') {
  configLoading = false
} else {
  database.selectApplicationConfig(config.account.accountId).then((data) => {
    const appConfig = data[0]
    _.merge(config, {
      account: {
        organizationId: appConfig.organization.id,
        user: {
          username: appConfig.endUser.id,
          password: appConfig.mqttUser.secret
        }
      }
    })

    configLoading = false
  }).catch((error) => {
    logger.error(error)
    configLoading = false
    // throw new Error('Can not get application config')
  })
}

// Show "loading" page until Blueprint data has been fetched.
app.use((req, res, next) => {
  if (!configLoading) {
    return next()
  }
})

// Routes
app.use(routes)

app.use('/script/config.js', (req, res) => {
  res.status(200).send(`
    window.CONCARIA_CONFIG = ${JSON.stringify(config)}
    window.DEVICES_CONFIG = ${JSON.stringify(devicesConfig)}
  `)
})

// Proxy route
app.use('/api/proxy', proxy)

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')))

module.exports = app
