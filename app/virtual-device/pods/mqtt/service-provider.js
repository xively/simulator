'use strict';

// A little wrapper for the MQTT service. Attempts to hide (most)
// of the browser globals from the rest of the application, like `port`,
// `user`, etc.
var mqttService = [
  function() {
    this.$get = [
      '$http',
      '$state',
      'mqtt',
      'userInfo',
      function($http, $state, mqtt, userInfo) {
        var host;
        var port;
        var user;
        var pw;
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

          setProperties: function(data) {
            host = data.host;
            port = data.port;
            user = data.user;
            pw = data.pw;
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
