'use strict'

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon')
const _ = require('lodash')

const config = require('../config/server')
const devicesConfigFile = require('../config/devices')
const db = require('./database')

const routes = require('./routes')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())

// Routes
app.use(routes)

app.use('/script/config.js', (req, res) => {
  db.selectDeviceConfig()
    .then((data) => {
      const devicesConfigDb = data[0].deviceConfig
      const devicesConfig = _.merge({}, devicesConfigFile, devicesConfigDb)

      res.status(200).send(`
        window.APP_CONFIG = ${JSON.stringify(config)}
        window.DEVICES_CONFIG = ${JSON.stringify(devicesConfig)}
      `)
    })
})

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')))

module.exports = app
