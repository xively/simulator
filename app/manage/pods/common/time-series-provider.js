'use strict';

var moment = require('moment');

module.exports = [
  function() {
    var providerOptions = {};
    this.options = function(_options) {
      providerOptions = _options;
    };

    this.$get = [
      '$http',
      'Login',
      function($http, Login) {
        var _getHistoryInterval = function(hours) {
          var startDate = moment().utc().subtract(hours || 24, 'hours');
          var endDate = moment().utc().add(24, 'hours');
          var format = 'YYYY.MM.DD HH:mm:ss';
          return {
            startDate: startDate.format(format),
            endDate: endDate.format(format),
          };
        };

        var buildTimeSeriesUrl = function(deviceId) {
          return 'https://' +
          providerOptions.host +
          '/api/v4/data/xi/blue/v1/' +
          encodeURIComponent(providerOptions.accountId) +
          '/d/' +
          encodeURIComponent(deviceId) +
          '/' +
          encodeURIComponent(providerOptions.channelnamemap.sensor);
        };

        var _getSensorHistoryConfig = function(options, jwt) {
          return {
            url: '/api/proxy',
            method: 'GET',
            params: {
              url: buildTimeSeriesUrl(options.deviceId),
              data: {
                'startDateTime': options.interval.startDate,
                'endDateTime': options.interval.endDate,
                'category': options.sensor,
              },
              headers: {
                'Authorization': 'Bearer ' + jwt,
              },
            },
          };
        };

        var _getSensorHistoryRaw = function(options) {
          return Login.try(function(jwt) {
            return $http(_getSensorHistoryConfig(options, jwt));
          })
          .then(function(response) {
            return response.data || {};
          });
        };

        var getSensorHistory = function(deviceId, sensor) {
          return _getSensorHistoryRaw({
            deviceId: deviceId,
            sensor: sensor,
            interval: _getHistoryInterval(),
          })
          .then(function(data) {
            return data.result || [];
          })
          .catch(function(error) {
            console.warn('TimeSeriesService.getSensorHistory', error);
            return [];
          });
        };

        var getMostRecentSensorHistory = function(deviceId) {
          return _getSensorHistoryRaw({
            deviceId: deviceId,
            interval: _getHistoryInterval(8),
          })
          .then(function(data) {
            var retVal = {};
            if (data.result) {
              var tmp = data.result.reverse();
              for (var i = 0, l = tmp.length; i < l; i++) {
                var item = tmp[i];
                if (typeof retVal[item.category] === 'undefined') {
                  retVal[item.category] = parseInt(item.numericValue, 10);
                }
                if (
                  typeof retVal.dust !== 'undefined' &&
                  typeof retVal.co !== 'undefined' &&
                  typeof retVal.humidity !== 'undefined' &&
                  typeof retVal.temp !== 'undefined' &&
                  typeof retVal.fan !== 'undefined' &&
                  typeof retVal.filter !== 'undefined'
                ) {
                  return retVal;
                }
              }
            }
            return retVal;
          })
          .catch(function(error) {
            console.warn('TimeSeriesService.getMostRecentSensorHistory', error);
            return {};
          });
        };

        return {
          getSensorHistory: getSensorHistory,
          getMostRecentSensorHistory: getMostRecentSensorHistory,
        };
      },
    ];
  },
];