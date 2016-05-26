const _ = require('lodash')
const Chart = require('chart.js')

require('./timeseries-chart.component.less')

const chartComponent = {
  template: `
    <canvas class="chart chart-line">
    </canvas>
  `,
  bindings: {
    device: '<',
    channel: '<'
  },
  controllerAs: 'chart',
  /* @ngInject */
  controller ($log, $element, $scope, devicesService) {
    const DATAPOINTS = 100

    let chart
    let unregisterWatch

    $scope.$watch(() => {
      return this.channel
    }, (newValue, oldValue) => {
      if (!newValue || !newValue.channel) {
        return
      }

      // remove old chart and unregister the sensor change listener
      if (chart) {
        chart.destroy()
        unregisterWatch()
      }

      const createChart = (timeSeries) => {
        // keep only the last few entries
        const data = timeSeries ? timeSeries.map((i) => i.numericValue).slice(-DATAPOINTS) : ['']
        const chartData = {
          // empty labels on the X axis
          labels: Array(data.length).fill(''),
          datasets: [{
            label: sensor,
            data,
            strokeColor: '#17bae3',
            fillColor: '#f5f5f5'
          }]
        }

        // create a new line chart
        const container = $element[0]
        const canvas = container.firstElementChild.getContext('2d')
        chart = new Chart(canvas).Line(chartData, {
          responsive: true,
          maintainAspectRatio: false,
          showTooltips: false,
          pointDot: false,
          datasetStrokeWidth: 4
        })

        // watch for new sensor data
        // save the unregister callback for later
        unregisterWatch = $scope.$watch(() => {
          return this.device.sensors[sensor]
        }, (newValue, oldValue) => {
          if (_.isNumber(newValue.numericValue)) {
            // add the new data point with an empty label
            chart.addData([newValue.numericValue], '')
            // if we reached the maximum data points, remove one
            if (chart.datasets[0].points.length > DATAPOINTS) {
              chart.removeData()
            }
          }
        })
      }

      // get history from timeseries
      const sensor = newValue.channelTemplateName
      devicesService.getTimeSeries(newValue.channel)
        .then(createChart)
        .catch(() => createChart())
    })
  }
}

module.exports = chartComponent
