'use strict';

var angular = require('angular');

module.exports = [
  '$q',
  'basicChartConfig',
  function($q, basicChartConfig) {

    var FusionCharts;

    var chartContainerId = 'sensor-history';
    var chartReady = $q(function(resolve, reject) {
      require.ensure([
        'script-loader!../../vendor/fusioncharts/fusioncharts',
        'script-loader!../../vendor/fusioncharts/fusioncharts.charts',
        'script-loader!../../vendor/fusioncharts/themes/fusioncharts.theme.ocean',
      ], function() {
        require('script-loader!../../vendor/fusioncharts/fusioncharts');
        require('script-loader!../../vendor/fusioncharts/fusioncharts.charts');
        require('script-loader!../../vendor/fusioncharts/themes/fusioncharts.theme.ocean');
        FusionCharts = window.FusionCharts;
        FusionCharts.ready(resolve);
      });
    });

    function _getChartBasicConfig() {
      return angular.merge(
        {},
        basicChartConfig,
        {
          renderAt: chartContainerId,
        }
      );
    }

    function getCleanChartInstance(customConfig) {
      return $q.when(chartReady)
      .then(function() {
        var chartConfig = angular.merge(
          {},
          _getChartBasicConfig(),
          customConfig || {}
        );
        console.log(chartConfig);
        return new FusionCharts(chartConfig);
      });
    }

    return getCleanChartInstance;
  },
];
