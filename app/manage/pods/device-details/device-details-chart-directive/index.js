'use strict';

var angular = require('angular');
var Promise = require('bluebird');

module.exports = [
  'Chart',
  function(Chart) {
    return {
      restrict: 'E',
      scope: {
        chartData: '=',
      },
      link: function($scope, element) {
        element.addClass('device-details-chart');

        if (!element.attr('id')) {
          element.attr('id', 'chart-' + Math.random().toString(10).substring(2));
        }
        var chartPromise = Promise.resolve()
        .delay()
        .then(function() {
          return new Chart(angular.merge({}, $scope.chartData, {renderAt: element.attr('id')}));
        });

        function updateChart() {
          chartPromise
          .then(function(chartInstance) {
            if ($scope.chartData) {
              chartInstance.setChartData(
                $scope.chartData.dataSource,
                'json'
              );
            }
          });
        }

        $scope.$watchCollection('chartData.dataSource.data', updateChart);
        updateChart();

        chartPromise
        .then(function(chartInstance) {
          chartInstance.render();
          chartInstance.addEventListener('rendered', function() {
            chartInstance.resizeTo('100%', 1);
            // TODO: can we do this better?
            chartInstance.resizeTo(
              '100%',
              element[0].offsetHeight - 6
            );
          });
        });
      },
    };
  },
];
