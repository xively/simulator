'use strict';

try {
  module.exports = JSON.parse(
    document.getElementById('env-json').text
  ).account;
}
catch (e) {
  console.warn('<script id="env-json" /> missing.');
}
