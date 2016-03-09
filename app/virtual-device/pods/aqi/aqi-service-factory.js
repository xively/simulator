'use strict';

// A controller needs access to the mock AQI value. This service provides
// that value periodically
var aqiService = ['$rootScope', 'AqiData',
  function($rootScope, AqiData) {
    // Polls the AQI service at this frequency
    var POLLING_FREQUENCY = 5000;

    var poll;
    return {
      init: function() {
        if (typeof poll !== 'undefined') {
          return;
        }
        this._poll();
      },

      _poll: function() {
        var that = this;
        AqiData.getLatestValue()
          .then(function(latestValue) {
            $rootScope.$broadcast('aqi.update', latestValue.value);
            setTimeout(that._poll.bind(that), POLLING_FREQUENCY);
          });
      },
    };
  }];

module.exports = aqiService;
