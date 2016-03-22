'use strict';

var request = require('request');

module.exports = function(options) {
  var whitelist = options.whitelist;
  return function(req, res, next) {
    var url = req.query.url;
    var whitelistCheck = whitelist.some(function(white) {
      return url.indexOf(white) === 0;
    });

    if (whitelistCheck) {
      request({
        uri: url,
        method: req.method,
        form: JSON.parse(req.query.data || '{}'),
        headers: JSON.parse(req.query.headers || '{}'),
      })
      .pipe(res);
    }
    else {
      return next();
    }
  };
};
