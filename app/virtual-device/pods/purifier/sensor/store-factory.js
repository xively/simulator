'use strict';

// Stores the internal state of each sensor (including the filter)
var sensorStore = ['$rootScope', '$cacheFactory', 'clamp', 'sensorProps',
  function($rootScope, $cacheFactory, clamp, sensorProps) {
    var cache = $cacheFactory('virtualDeviceStore');

    // Add our initial values to the cache
    var sensorKeys = Object.keys(sensorProps);
    sensorKeys.forEach(function(key) {
      cache.put(key, Number(sensorProps[key].initial));
    });

    return {
      get: function(key) {
        return cache.get(key);
      },

      set: function(key, value) {
        if (sensorKeys.indexOf(key) === -1) {
          return false;
        // Only allow numbers
        } else if (typeof value !== 'number') {
          return false;
        }

        // Ensure that the submitted value is within the
        // acceptable range
        var propDef = sensorProps[key];
        value = clamp(value, propDef.min, propDef.max);

        // Ignore it if it's the same as what we already have
        if (cache.get(key) === value) {
          return false;
        }

        cache.put(key, value);
        $rootScope.$broadcast('device.sensors', key, value);

        // Return `true` to let the caller know that it was a success
        return true;
      },
    };
  }];

module.exports = sensorStore;
