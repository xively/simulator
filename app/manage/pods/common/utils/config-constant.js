'use strict';

var config = {};
try {
  config = JSON.parse(document.getElementById('env-json').text);
} catch (e) {
  // ignore
}

module.exports = config;
