'use strict';

var url = require('url');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

// Export a factory function that works like "new Store()" except that
// methods are bound to the instance, for ease-of-use.
exports = module.exports = function() {
  var store = new exports.Store();
  for (var prop in store) {
    if (typeof store[prop] === 'function') {
      store[prop] = store[prop].bind(store);
    }
  }
  return store;
};

// https://devcenter.heroku.com/articles/redistogo#using-with-node-js
// https://elements.heroku.com/addons/redistogo
function Store() {
  if (process.env.REDISTOGO_URL) {
    this.mode = 'redis';
    this.redisClient = this.createRedisClient();
  }
  else {
    this.mode = 'file';
  }
}

exports.Store = Store;

Store.prototype.retryDelay = 3000;

Store.prototype._retry = function(prefix, getPromise) {
  var retryDelay = this.retryDelay;
  var wrapped = function() {
    return Promise.try(getPromise)
    .catch(function(err) {
      console.error('[' + prefix + ']', err.message);
      return Promise.delay(retryDelay)
      .then(wrapped);
    });
  };
  return wrapped();
};

Store.prototype.createRedisClient = function() {
  return new Promise(function(resolve, reject) {
    var rtg = url.parse(process.env.REDISTOGO_URL);
    var redisClient = redis.createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(':')[1]);
    redisClient.on('connect', function() {
      resolve(redisClient);
    });
    redisClient.on('error', function(err) {
      if (err.code === 'ECONNREFUSED') {
        console.error(err);
        return;
      }
      throw err;
    });
  });
};

Store.prototype.getFile = function(key) {
  return path.join(__dirname, '..', 'store-' + key + '.json');
};

Store.prototype.set = function(key, value) {
  var json = JSON.stringify(value, null, 2);
  var filepath;
  if (this.mode === 'file') {
    filepath = this.getFile(key);
    console.error('Store.set (%s)', filepath);
    return fs.writeFileAsync(filepath, json);
  }
  console.error('Store.set (%s)', key);
  return this.redisClient.then(function(redisClient) {
    return redisClient.setAsync(key, json);
  });
};

Store.prototype.get = function(key) {
  var filepath;
  if (this.mode === 'file') {
    filepath = this.getFile(key);
    return this._retry('Store.get (file)', function() {
      return fs.readFileAsync(filepath).then(JSON.parse);
    });
  }
  return this._retry('Store.get (redis)', function() {
    return this.redisClient
      .then(function(redisClient) {
        return redisClient.getAsync(key);
      })
      .then(function(json) {
        if (json == null) {
          throw new Error('Key ' + key + ' not found.');
        }
        return json;
      })
      .then(JSON.parse);
  }.bind(this));
};
