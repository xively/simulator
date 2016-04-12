'use strict'

const logger = require('winston')
const request = require('request')
const config = require('../config/server')

function parseParameter (param) {
  let parsedParameter = {}

  try {
    parsedParameter = JSON.parse(param)
  } catch (e) {
    logger.debug('#parseParameter', e)
  }

  return parsedParameter
}

module.exports = function (req, res, next) {
  const url = req.query.url

  const isWhitelisted = config.server.whitelist.some((whiteListedUrl) => url.startsWith(whiteListedUrl))

  if (isWhitelisted) {
    request({
      uri: url,
      method: req.method,
      qs: parseParameter(req.query.data),
      headers: parseParameter(req.query.headers)
    }).pipe(res)
  } else {
    next()
  }
}
