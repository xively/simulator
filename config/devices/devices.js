'use strict'

const filterRule = (latestValue, sensors) => {
  const DEPLETION_RATES = [0, 0.7, 1]
  const fanSensor = sensors.get('fan')
  const dustSensor = sensors.get('dust')

  const dustCoefficient = Math.pow(dustSensor.latestValue / 100, 7)
  const depletion = DEPLETION_RATES[fanSensor.latestValue] * dustCoefficient

  return latestValue - depletion / 3600
}

// TODO store device information
// proposal: https://gist.github.com/tothandras/a903647365d1a204c9d1ab7f8b8f8f17
// like: name, type, min, max, initial, wiggle, image, sensor positions, unit
const config = {
  hiddenChannels: ['sensor', 'control'],
  widgets: [],
  HomeAirPurifier: {
    image: '/devices/images/home-air-purifier.png',
    width: 680,
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
        rule: filterRule,
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
          input: false,
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
        widget: {
          name: 'fan-control',
          position: {
            top: 260,
            left: 331
          }
        }
      }
    }
  },
  ['Industrial HVAC']: {
    image: '/devices/images/industrial-hvac.png',
    width: 1000,
    widgets: ['fan-state-control', 'filter'],
    sensors: {
      dust: {
        min: 0,
        max: 500,
        wiggle: true,
        unit: 'mg/m³',
        tooltip: {
          position: {
            top: 30,
            left: 210
          },
          labelPosition: {
            top: 12,
            left: -14
          },
          distance: 100,
          direction: 'left'
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
            top: 30,
            left: 660
          },
          labelPosition: {
            top: 12,
            left: -8
          },
          distance: 100,
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
            top: 300,
            left: 640
          },
          labelPosition: {
            top: -7,
            left: -45
          },
          distance: 100,
          direction: 'top'
        }
      },
      humidity: {
        min: 0,
        max: 100,
        wiggle: true,
        unit: '%',
        tooltip: {
          position: {
            top: 300,
            left: 270
          },
          labelPosition: {
            top: -7,
            left: 14
          },
          distance: 100,
          direction: 'top'
        }
      },
      filter: {
        min: 0,
        max: 1000,
        default: 1000,
        rule: filterRule,
        tooltip: {
          position: {
            top: 268,
            left: 120
          },
          labelPosition: {
            top: 14,
            left: -18
          },
          distance: 100,
          direction: 'bottom',
          input: false,
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
        widget: {
          name: 'fan-control',
          position: {
            top: 245,
            left: 820
          }
        }
      }
    }
  }
}

module.exports = config
