'use strict';

var angular = require('angular');
var Promise = require('bluebird');

module.exports = [
  'AqiData',
  'TimeSeries',
  'basicChartConfig',
  'aqiChartConfig',
  'sensorChartConfig',
  function(
    AqiData,
    TimeSeries,
    basicChartConfig,
    aqiChartConfig,
    sensorChartConfig
  ) {
    function loadDataSource(options) {
      var deviceId = options.deviceId;
      var sensor = options.sensor;
      return Promise.resolve()
      .then(function() {
        if (sensor === 'aqi') {
          return AqiData.getHistory()
          .then(function(data) {
            var actData = {};
            var latestCategory = null;
            var maxCategory = null;
            var minValue = null;
            var maxValue = null;

            actData.data = data.map(function(item, i) {
              if (!minValue) {
                minValue = item.time;
              }
              var actCategory = AqiData.categoryByValue(item.value);
              var actValue = {
                value: item.value,
                anchorBorderColor: actCategory.color,
              };
              if (latestCategory == null || latestCategory !== actCategory) {
                if (!maxCategory || maxCategory.level < actCategory.level) {
                  maxCategory = actCategory;
                }
                latestCategory = actCategory;
              }
              maxValue = item.time;
              return actValue;
            });

            if (!actData.chart) {
              actData.chart = {};
            }
            if (maxCategory) {
              actData.chart.plotgradientcolor = maxCategory.color;
              actData.chart.yaxismaxvalue = maxCategory.threshold;
            }
            actData.chart.xaxisname =
              'Between ' + new Date(minValue) + ' and ' + new Date(maxValue);
            return actData;
          });
        }

        return TimeSeries.getSensorHistory(deviceId, sensor)
        .then(function(data) {
          return {
            data: data.map(function(item) {
              return {value: item.numericValue};
            }),
          };
        });
      });
    }

    return {
      baseChartData: function(options) {
        return angular.merge(
          {},
          basicChartConfig,
          {dataSource: options.sensor === 'aqi' ? aqiChartConfig : sensorChartConfig}
        );
      },

      loadDataSource: loadDataSource,
    };
  },
];
