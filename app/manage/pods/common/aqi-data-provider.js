'use strict';

var moment = require('moment');

module.exports = [
  function() {
    var options = {};
    this.options = function(_options) {
      options = _options;
    };

    this.$get = [
      '$q',
      '$http',
      'aqiCategories',
      function(
        $q,
        $http,
        aqiCategories
      ) {
        var getCategoryByValue = function(value) {
          for (var i in aqiCategories.level) {
            if (
              aqiCategories.level.hasOwnProperty(i) &&
              value <= aqiCategories.level[i].threshold
            ) {
              return aqiCategories.level[i];
            }
          }
          return aqiCategories.level[aqiCategories.labelMap[6]];
        };

        var queriedData = {};

        return {
          categoryByValue: getCategoryByValue,

          getLatestValue: function() {
            return this.getHistory()
            .then(function(data) {
              var value = 0;
              if (data.length) {
                value = data[data.length - 1].value;
              }
              return {
                value: value,
                category: getCategoryByValue(value),
              };
            });
          },

          getHistory: function() {
            var _getHistoryInterval = function() {
              var startDate = moment().subtract(5 * 24 + 1, 'hours').utc();
              var endDate = moment().subtract(1, 'hours').utc();
              var format = 'YYYY-MM-DD[T]HH';
              return {
                startDate: startDate.format(format),
                endDate: endDate.format(format),
              };
            };

            var _getAqiHistory = function(apiKey, boundingBox) {
              var interval = _getHistoryInterval();
              return $http({
                url: '/api/proxy',
                method: 'GET',
                params: {
                  'url': 'http://www.airnowapi.org/aq/data/',
                  'data': {
                    'startDate': interval.startDate,
                    'endDate': interval.endDate,
                    'parameters': 'PM25',
                    'BBOX': boundingBox,
                    'dataType': 'A',
                    'format': 'application/json',
                    'API_KEY': apiKey,
                  },
                },
              })
              .then(function(response) {
                console.log('/api/proxy', response);
                return response.data;
              })
              .catch(function(e) {
                console.error(e.stack || e);
                throw e;
              })
              .then(function(data) {
                var retVal = [];
                var retIdx = null;
                for (var i = 0, l = data.length; i < l; i++) {
                  var dataPoint = data[i];
                  if (dataPoint.AQI === -999) {
                    dataPoint.AQI = 0;
                  }
                  var idx = dataPoint.Latitude + String(dataPoint.Longitude);
                  if (!retIdx) {
                    retIdx = idx;
                  } else if (retIdx !== idx) {
                    continue;
                  }
                  retVal.push({
                    time: dataPoint.UTC,
                    value: dataPoint.AQI,
                  });
                }
                return retVal;
              });
            };

            var getAqiHistory = function(apiKey, boundingBox) {
              if (!queriedData[boundingBox]) {
                queriedData[boundingBox] = _getAqiHistory(apiKey, boundingBox);
              }
              return queriedData[boundingBox];
            };

            return getAqiHistory(
              options.apikey,
              options.boundingbox
            );
          },
        };
      },
    ];
  },
];
