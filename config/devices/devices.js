'use strict'

// TODO store device information
// proposal: https://gist.github.com/tothandras/a903647365d1a204c9d1ab7f8b8f8f17
// like: name, type, min, max, initial, wiggle, image, sensor positions, unit
const config = {
  hiddenChannels: ['sensor', 'control', 'device-log'],
  widgets: [],
  AirSoClean3000: {
    image: 'airsoclean3000.png',
    widgets: ['fan-state-control', 'filter'],
    sensors: {
      dust: {
        min: 0,
        max: 500,
        wiggle: true,
        unit: 'mg/m³',
        tooltip: {
          position: {
            top: 82,
            left: 344
          },
          labelPosition: {
            top: 12,
            left: -14
          },
          distance: 90,
          direction: 'top'
        }
      },
      co: {
        min: 0,
        max: 500,
        default: 100,
        wiggle: true,
        unit: 'PPM',
        tooltip: {
          position: {
            top: 73,
            left: 526
          },
          labelPosition: {
            top: 12,
            left: -8
          },
          distance: 153,
          direction: 'right'
        }
      },
      temp: {
        min: -40,
        max: 125,
        wiggle: true,
        unit: '°F',
        tooltip: {
          position: {
            top: 283,
            left: 536
          },
          labelPosition: {
            top: -7,
            left: -45
          },
          distance: 143,
          direction: 'right'
        }
      },
      humidity: {
        min: 0,
        max: 100,
        wiggle: true,
        unit: '%',
        tooltip: {
          position: {
            top: 283,
            left: 147
          },
          labelPosition: {
            top: -7,
            left: 14
          },
          distance: 143,
          direction: 'left'
        }
      },
      filter: {
        min: 0,
        max: 1000,
        default: 1000,
        rule: (latestValue, sensors) => {
          const DEPLETION_RATES = [0, 0.7, 1]
          const fanSensor = sensors.get('fan')
          const dustSensor = sensors.get('dust')

          const dustCoefficient = Math.pow(dustSensor.latestValue / 100, 7)
          const depletion = DEPLETION_RATES[fanSensor.latestValue] * dustCoefficient

          return latestValue - depletion / 3600
        },
        tooltip: {
          position: {
            top: 525,
            left: 120
          },
          labelPosition: {
            top: 14,
            left: -18
          },
          distance: 116,
          direction: 'left',
          actions: [{
            label: 'Deplete',
            channel: 'filter',
            value: 0
          }, {
            label: 'Replace',
            channel: 'filter',
            value: 1000
          }]
        }
      },
      fan: {
        min: 0,
        max: 2,
        default: 0,
        simulation: (latestValue, sensors) => {
          return (latestValue + 1) % 3
        },
        wiggle: false,
        widget: 'fan-control'
      }
    }
  }
}

module.exports = config
