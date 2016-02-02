'use strict';

// A little wrapper for the MQTT service. Attempts to hide (most)
// of the browser globals from the rest of the application, like `port`,
// `user`, etc.
var mqttService = [
  function() {
    var options = {};
    this.options = function(_options) {
      options = _options;
    };

    this.$get = [
      'mqtt',
      'userInfo',
      function(mqtt, userInfo) {
        var host = options.host;
        var port = Number(options.port);
        var user = options.username;
        var pw = options.password;
        var useSSL = true;

        return {
          // Open a connection or ensure that one exists
          ensureConnection: function() {
            mqtt.connect(host, port, user, pw, useSSL);
          },

          // Send `data` over `channelName`
          sendMessage: function(data, channelName) {
            this.ensureConnection();
            mqtt.sendMessage(data, channelName, host, port, user, pw, useSSL);
          },

          // Subscribe `cb` to `channelName`
          subscribe: function(channelName, cb) {
            this.ensureConnection();
            mqtt.subscribe(channelName, cb, host, port, user, pw, useSSL);
          },
        };
      },
    ];
  }];

module.exports = mqttService;
