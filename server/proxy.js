'use strict';

const request = require('request');
const config = require('./config');

module.exports = function(req, res, next) {
  const url = req.query.url;

  const isWhitelisted = config.server.whitelist.some((whiteListedUrl) => url.indexOf(whiteListedUrl) === 0);

  if (isWhitelisted) {
    request({
      uri: url,
      method: req.method,
      qs: req.query.data ? JSON.parse(req.query.data) : {},
      headers: req.query.headers ? JSON.parse(req.query.headers) : {}
    })
    .pipe(res);
  } else {
    return next();
  }
};
