'use strict'

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon')

const config = require('../config/server')
const devicesConfig = require('../config/devices')

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
  res.status(200).send(`
    window.CONCARIA_CONFIG = ${JSON.stringify(config)}
    window.DEVICES_CONFIG = ${JSON.stringify(devicesConfig)}
  `)
})

// Serve up favicon
app.use(favicon(path.join(__dirname, '/favicon.ico')))

module.exports = app
