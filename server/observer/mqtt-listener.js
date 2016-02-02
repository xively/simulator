'use strict';

// TODO: Think about how this would scale across dynos?

var mqtt = require('mqtt');

// express inspired
// express has app.use('path', function(req, res, next))
// MqttListener has listener.use('channel', function(data, next));
// data == req in this comparison
// data can get modified anywhere down the chain and it will persist into the next call
// https://www.npmjs.com/package/route-parser

function MqttListener(options) {
  // mqtt config
  this._mqttConfig = options;
  // client
  this._client = this._connect();
  // channels to subscribe to per device
  this._channels = [];
  // devices to subscribe to
  this._devices = [];
  // list of topics we should be subscribed to
  this._topics = [];
  // list of topics we are not subscribed to yet
  this._toSubscribe = [];
  // subscription state machine. Either finished or working
  // todo: enum
  this._subscriberState = 'finished';
  // callbacks
  this._callbacks = {};
  // preprocess functions (run one before array of callbacks);
  this._preprocess = {};
  // Register callbacks. (Not 100% sure .bind() is the cleanest way around this)
  this._client.on('error', this._onError.bind(this));
  this._client.on('reconnect', this._onReconnect.bind(this));
  this._client.on('close', this._onClose.bind(this));
  this._client.on('offline', this._onOffline.bind(this));
  this._client.on('message', this._onMessage.bind(this));
  this._client.on('connect', this._onConnect.bind(this), console.error);
}


// public methods

MqttListener.prototype.addDevice = function(deviceId) {
  if (this._devices.indexOf(deviceId) !== -1) {
    // If it already exists
    return;
  }

  this._devices.push(deviceId);

  var that = this;
  this._channels.forEach(function(channel) {
    that._addTopic(deviceId, channel);
  });
};

MqttListener.prototype.addChannel = function(channel) {
  if (this._channels.indexOf(channel) !== -1) {
    // If it already exists
    return;
  }
  this._channels.push(channel);
  this._callbacks[channel] = [];
  this._preprocess[channel] = function() {};

  var that = this;
  this._devices.forEach(function(deviceId) {
    that._addTopic(deviceId, channel);
  });
};

MqttListener.prototype.use = function(channel, callback) {
  if (typeof callback === 'function') {
    if (this._channels.indexOf(channel) === -1) {
      this.addChannel(channel);
    }

    this._callbacks[channel].push(callback);
  }
  else {
    // throw error
  }
};


// private methods

MqttListener.prototype._addTopic = function(deviceId, channel) {
  var topic = 'xi/blue/v1/' + this._mqttConfig.accountId + '/d/' + deviceId + '/' + channel;
  // If this topic already is in the list, skip
  if (this._topics.indexOf(topic) === -1) {
    this._topics.push(topic);
  }

  if (this._toSubscribe.indexOf(topic) === -1) {
    this._toSubscribe.push(topic);
    this._subscribeAll();
  }
};

MqttListener.prototype._subscribeAll = function() {
  // don't clobber the subscription server
  // fraiser once said a wise man borked the broker this way
  var that = this;
  var subscribeNext = function() {
    if (that._toSubscribe.length === 0) {
      // If we have nothing else to subscribe to
      that._subscriberState = 'finished';
      console.log('subscribed to %s channels', that._topics.length);
    }
    else {
      var topic = that._toSubscribe[0];
      console.log('subscribing to to', topic);
      that._client.subscribe(topic, function(error, granted) {
        if (error !== null) {
          // throw new Error(error);
          console.error(error);
        }

        if (granted.qos === 128) {
          // TODO: Remove topic from list of topics if denied?
          // throw new Error('Subscription denied for '+topic);
          console.error('subscription denied for ' + topic);
        }

        that._toSubscribe.shift();
        subscribeNext();
      });
    }
  };

  if (this._subscriberState === 'finished' && this._toSubscribe.length > 0) {
    this._subscriberState = 'working';
    subscribeNext();
  }
};

MqttListener.prototype._connect = function() {
  console.log('Starting MQTT Listener');
  return mqtt.connect(this._mqttConfig.host, this._mqttConfig);
};


// private event handlers

MqttListener.prototype._onConnect = function() {
  console.log('connected, subscribing now');
  this._subscribeAll();
};

MqttListener.prototype._onError = function(error) {
  console.log('error: ' + JSON.stringify(error));
};

MqttListener.prototype._onClose = function() {
  console.log('connection closed');
};

MqttListener.prototype._onReconnect = function() {
  console.log('reconnected');

  // Clear out existing pending subscriptions in case we disconnected mid-subscribe
  this._toSubscribe = [];

  // Copy the values of topics into subscribe
  this._toSubscribe.push.apply(this._toSubscribe, this._topics);
};

MqttListener.prototype._onOffline = function() {
  console.log('offline');
};

MqttListener.prototype._onMessage = function(topic, message) {
  // Get device and channel details
  var topicArray = topic.split('/');
  var deviceId = topicArray[5];
  var channel = topicArray[6];
  message = message.toString();

  // TODO: Maybe check device ID too?
  if (this._channels.indexOf(channel) !== -1) {
    var data = {
      deviceId: deviceId,
      channel: channel,
      message: message,
      topic: topic,
    };

    // Iterates one at a time each time next is called. Starting at -1 brings us to zero
    var currentIndex = -1;
    var that = this;
    var next = function() {
      currentIndex++;
      if (typeof that._callbacks[channel][currentIndex] !== 'undefined') {
        // If we have a callback to run..
        try {
          that._callbacks[channel][currentIndex](data, next);
        }
        catch (error) {
          console.log(error.stack);
          return next();
        }
      }
      else {
        // we already ran our last callback, so we..
        // cleanup memory?
      }
    };

    return next();
  }
};

module.exports = MqttListener;