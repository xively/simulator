'use strict';

var request = require('request');

module.exports = function(options) {
  var whitelist = options.whitelist;
  return function(req, res, next) {
    var url = req.query.url;
    if (whitelist.reduce(function(carry, white) {
      return carry || url.indexOf(white) === 0;
    }, false)) {
      request({
        uri: url,
        qs: JSON.parse(req.query.data || '{}'),
        headers: JSON.parse(req.query.headers || '{}'),
      })
      .pipe(res);
    }
    else {
      return next();
    }
  };
};
