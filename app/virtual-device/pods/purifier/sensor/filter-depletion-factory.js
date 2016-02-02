'use strict';

// The rate at which our filter's life is updated, in milliseconds.
var FILTER_UPDATE_RATE = 1000;

// The rate at which our filter depletes. The units are hours lost with each
// tick of the loop of the filter life.
// Each value is how much life you get under "standard" dust levels. High
// yields 1 hour per hour, which makes sense. Low gives you some extra life
// to the filter. The indices for these line up with the numeric value of a
// fan speed value.
var DEPLETION_RATES = [0, 0.7, 1];

// How much faster this simulation goes relative to true time. Each second
// in the simulation is multiplied by this value.
var SIMULATION_SPEED_FACTOR = 60;

var SECONDS_IN_HOUR = 60 * 60;

// This is a simple, exponential implementation of a dust coefficient. When
// there's no dust, then the filter doesn't deplete. When there's a dust level
// of 100, then it depletes at the rate specified by DEPLETION_RATES. And for
// each additional 100, it increases dramatically.
function dustMultipler(dustLevel) {
  return Math.pow(dustLevel / 100, 5.15);
}

var filterDepletion = [
  '$rootScope', 'mqttDeviceInfoPublisher', 'sensorStore', 'mqttSensorPublisher',
  function(
    $rootScope, mqttDeviceInfoPublisher, sensorStore, mqttSensorPublisher
  ) {
    // Get our depletion rate based on the default fan state
    function getDepletionRate() {
      return DEPLETION_RATES[sensorStore.get('fan')];
    }

    function depleteAmount() {
      var dustLevel = sensorStore.get('dust');
      var dustCoefficient = dustMultipler(dustLevel);
      var depletion = getDepletionRate() * dustCoefficient;
      depletion *= SIMULATION_SPEED_FACTOR;
      return depletion / SECONDS_IN_HOUR;
    }

    return {
      // Initialize our loop, which periodically reduces our filter life.
      init: function() {
        setInterval(this._reduceFilterLife.bind(this), FILTER_UPDATE_RATE);
      },

      // Update the life of the filter
      setFilterLife: function(newValue, options) {
        sensorStore.set('filter', Number(newValue));
      },

      // Give ourselves a brand new filter. Sets the current life to be max,
      // then emits a filter change event.
      replaceFilter: function(deviceId, channel) {
        this.setFilterLife(1000);
        mqttDeviceInfoPublisher.publishFilterChange(deviceId, channel);
        mqttSensorPublisher.publishUpdate(['filter'], channel);
      },

      // Completely deplete the existing filter
      depleteFilter: function(deviceId, channel) {
        // The total number of messages that we're sending
        var totalMessages = 10;
        // The duration that we're sending them across
        var timespan = 5000;
        // Simulate a pollution event by setting the dust to be 500
        var cachedDust = sensorStore.get('dust');
        var cachedFan = sensorStore.get('fan');
        sensorStore.set('dust', 500);
        sensorStore.set('fan', 2);
        $rootScope.$broadcast('device.filterDepleting', true);

        var that = this;
        var count = totalMessages;
        var poll = setInterval(function() {
          that._reduceFilterLife();
          mqttSensorPublisher.publishUpdate(['filter'], channel);
          count = --count;
          // Bail if our count is up, or if the filter is completely depleted
          if (!count || !sensorStore.get('filter')) {
            sensorStore.set('dust', cachedDust);
            sensorStore.set('fan', cachedFan);
            $rootScope.$broadcast('device.filterDepleting', false);
            clearInterval(poll);
          }
        }, timespan / totalMessages);
      },

      _reduceFilterLife: function() {
        var currentLife = sensorStore.get('filter');
        // Subtract life from our filter. This coerces our string
        // to a number
        var newLife = currentLife - depleteAmount();
        // Ensure that it doesn't go below 0
        newLife = Math.max(newLife, 0);
        // Once again we set it as a string to avoid floating point errors
        this.setFilterLife(Number(newLife.toFixed(2)));
      },
    };
  }];

module.exports = filterDepletion;
