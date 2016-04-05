'use strict';

var LogParser = function(logObject) {
  var whiteList = ['sourceId', 'code', 'message', 'details', 'severity', 'tags']; // TODO: const
  var measurements = [];
  whiteList.forEach(function(key) {
    measurements.push({
      name: key,
      value: JSON.parse(logObject.message)[key]
    });
  });
  return measurements;
};


module.exports = LogParser;
