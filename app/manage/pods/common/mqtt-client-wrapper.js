'use strict';

var _ = require('lodash');
var MqttClient = require('../../../vendor/xively-mqtt-client');

// TODO: remove once upstreamed into the client.
(function(Client) {
  Client.prototype._send = function(topic, msg) {
    if (!this.isConnected()) { return; }
    if (typeof msg === 'string') {
      msg = {payloadString: msg};
    }
    msg = _.defaults({}, msg, {destinationName: topic});
    var message = new Client.MQTT.Message(msg.payloadString);
    _.forOwn(_.omit(msg, 'payloadString'), function(value, key) {
      message[key] = value;
    });
    this._log('Emitting message on host "' + this._host + '": ' + msg.payloadString);
    this._client.send(message);
  };
})(MqttClient.Client);

// Create a xively-device-specific wrapper around MqttClient. Any options
// specified via the "mqtt" property will be passed in when subscribing and
// unsubscribing to topics.
function MqttClientWrapper(options) {
  this.client = exports.MqttClient.get(_.omit(options, 'mqtt'));
  this.client.connect();
  this._mqttOptions = options.mqtt || {};
  this._topics = {};
}

exports = module.exports = MqttClientWrapper;
exports.MqttClient = MqttClient;

// Parse sensor and value from a xively mqtt message object.
MqttClientWrapper.prototype._parseMessage = function(message) {
  var payloadString = message && message.payloadString || '';

  if (payloadString[0] === '{') {
    return JSON.parse(payloadString);
  }

  return _.zipObject(payloadString.split('\n').map(function(row) {
    var parts = row.split(',');
    var sensor = parts[1];
    var value = parts[2];
    // Coerce the value to a number. If it seems valid, use the number value.
    if (String(Number(value)) === value) {
      value = Number(value);
    }
    return [sensor, value];
  }));
};

// For a given message + topic, call all registered callbacks.
MqttClientWrapper.prototype._handleMessage = function(topic, message) {
  var data = this._parseMessage(message);
  this._topics[topic].forEach(function(topicObj) {
    function fn() {
      if (topicObj.raw) {
        topicObj.callback(data);
      }
      else if (topicObj.command) {
        topicObj.callback(data.option, data.command);
      }
      else if (topicObj.sensor) {
        topicObj.callback(data[topicObj.sensor], topicObj.sensor);
      }
      else {
        _.each(data, topicObj.callback);
      }
    }

    if (
      !topicObj.sensor && !topicObj.command ||
      topicObj.sensor && topicObj.sensor in data ||
      topicObj.command && topicObj.command === data.command
    ) {
      // If an angular $scope is passed, run the callback inside its $apply
      // method.
      if (topicObj.$scope) {
        topicObj.$scope.$apply(fn);
      }
      // Otherwise, just run the callback.
      else {
        fn();
      }
    }
  });
};

// Only store necessary properties in topic arrays.
MqttClientWrapper.prototype._topicObjProps = [
  'group',
  'topic',
  'raw',
  'sensor',
  'command',
  '$scope',
  'callback',
];

// Subscribe to a topic. If "sensor" is omitted, callback will fire for all
// sensors for that topic. If specified, callback will fire only if the sensor
// matches. The "group" option is an optional arbitrary string that may be
// matched when unsubscribing (like a jQuery event "namespace").
MqttClientWrapper.prototype.subscribe = function(options) {
  if (!options) { options = {}; }
  if (!options.topic) {
    throw new TypeError('MqttClientWrapper#subscribe: topic required.');
  }
  else if (!options.callback) {
    throw new TypeError('MqttClientWrapper#subscribe: callback required.');
  }
  // If no callbacks have been bound for this topic, create an array for it and
  // subscribe to the topic.
  if (!this._topics[options.topic]) {
    this._topics[options.topic] = [];
    this.client.subscribe(
      options.topic,
      this._handleMessage.bind(this, options.topic),
      this._mqttOptions
    );
  }
  // Add this callback (and other data) as an object to the topic array.
  var topicObj = _.pick(options, this._topicObjProps);
  this._topics[options.topic].push(topicObj);
  return this;
};

// Unsubscribe from a topic.
MqttClientWrapper.prototype.unsubscribe = function(options) {
  if (!options) { options = {}; }
  if (!options.topic) {
    throw new TypeError('MqttClientWrapper#unsubscribe: topic required.');
  }
  var topicObjs = this._topics[options.topic];
  if (topicObjs) {
    // Remove any topic object for which all relevant specified options match.
    _.remove(topicObjs, function(topicObj) {
      return _(options).pick(this._topicObjProps).every(function(value, prop) {
        return topicObj[prop] === value;
      });
    }, this);
    // If no topic objects remain, unsubscribe from the topic and clean up the
    // array.
    if (topicObjs.length === 0) {
      delete this._topics[options.topic];
      this.client.unsubscribe(
        options.topic,
        this._mqttOptions
      );
    }
  }
  return this;
};

// Send a command to the listening device
MqttClientWrapper.prototype.sendCommand = function(deviceTopic, command) {
  var topic;
  if (typeof deviceTopic === 'string') {
    topic = deviceTopic;
  }
  else {
    topic = _.find(deviceTopic.channels, 'channelTemplateName', 'control').channel;
  }

  command = _.clone(command);
  command.type = 'command';

  this.client.send(topic, JSON.stringify(command));
};

// Send a sensor+value xively mqtt message on the specified topic or the sensor
// channel of the specified device.
MqttClientWrapper.prototype.sendSensorData = function(topic, sensor, value) {
  var sensors;
  var sendOptions = {};
  // If a sensors map is sent, retain sensor data.
  if (arguments.length === 2) {
    sendOptions.retained = true;
    sensors = sensor;
  }
  // Otherwise, don't retain the data.
  else {
    sensors = {};
    sensors[sensor] = value;
  }
  // If a device object is passed as the first argument, get its sensor channel.
  if (typeof topic !== 'string') {
    topic = _.find(topic.channels, 'channelTemplateName', 'sensor').channel;
  }

  sendOptions.payloadString = _.map(sensors, function(val, key) {
    return ['', key, val, ''].join(',');
  }).join('\n');

  this.client.send(topic, sendOptions);
};
