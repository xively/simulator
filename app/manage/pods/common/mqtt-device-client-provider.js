'use strict';

var MqttClientWrapper = require('./mqtt-client-wrapper');

module.exports = [
  function MqttDeviceClient() {
    var options = {};
    this.options = function(_options) {
      options = _options;
    };

    this.$get = [
      function() {
        return new MqttClientWrapper({
          host: options.host,
          port: Number(options.port),
          useSSL: true,
          user: options.username,
          pass: options.password,
          // debug: true,
        });
      },
    ];
  },
];
