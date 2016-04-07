'use strict';

var _ = require('lodash');

require('paho');
var MqttClient = require('../../../vendor/xively-mqtt-client');

var generateUniqueId = require('./generate-unique-id');

module.exports = function() {
  var mqttObj = {};

  var client = _.memoize(function(host, port, user, pass, useSSL, clientId) {
    var newClient = MqttClient
      .get({
        host: host,
        port: port,
        user: user,
        pass: pass,
        useSSL: useSSL,
        clientId: generateUniqueId(),
        debug: true
      });
    newClient.connect();
    return newClient;
  }, function(host, port, user, pass, useSSL, clientId) {
    return [host, port, user, pass, useSSL, clientId].join('||');
  });

  mqttObj.connect = function(host, port, user, pass, useSSL, clientId) {
    client(host, port, user, pass, useSSL, clientId);
  };

  mqttObj.subscribe = function(
    topic, callback,
    host, port, user, pass, useSSL, clientId
  ) {
    client(host, port, user, pass, useSSL, clientId)
      .subscribe(topic, callback);
  };

  mqttObj.sendMessage = function(
    msg, topic,
    host, port, user, pass, useSSL
  ) {
    client(host, port, user, pass, useSSL)
      .send(topic, msg);
  };

  return mqttObj;
};
