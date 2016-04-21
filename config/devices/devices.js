'use strict'

/* Devices configuration

  {
    [DeviceTemplateName]: {
      image: String // image url
      width: Number // container width
      widgets: [String] // custom components
      sensors: {
        [name]: {
          unit: String
          min: Number // minimum value
          max: Number // maximum value
          wiggle: Boolean // simulation wiggle
          tooltip: {
            position: { // tooltip placement on the device image

            }
          }
        }
      }
    }
  }

*/

const filterRule = (latestValue, sensors) => {
  const DEPLETION_RATES = [0, 0.7, 1]
  const fanSensor = sensors.get('fan')
  const dustSensor = sensors.get('dust')

  const dustCoefficient = Math.pow(dustSensor.latestValue / 100, 7)
  const depletion = DEPLETION_RATES[fanSensor.latestValue] * dustCoefficient

  return latestValue - depletion / 3600
}

const config = {
  hiddenChannels: ['sensor', 'control'],
  widgets: [],
  ['Home Air Purifier']: {
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
        },
        deviceLog: {
          connect: {
            level: 'informational',
            message: 'Dust sensor connected',
            details: 'GP2Y1010AU0F driver initialization complete'
          }
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
        },
        deviceLog: {
          connect: {
            level: 'informational',
            message: 'CO sensor connected',
            details: 'MQ-7 drive initialization complete'
          }
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
        },
        deviceLog: {
          connect: {
            level: 'informational',
            message: 'Thermometer connected',
            details: 'TMP36 driver initialization complete'
          }
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
            value: JSON.stringify({
              command: 'filter',
              option: 5
            }),
            notification: {
              type: 'error',
              text: 'This device’s filter is low. It should be replaced to ensure optimal air quality.',
              sticky: true
            }
          }, {
            label: 'Replace',
            value: JSON.stringify({
              command: 'filter',
              option: 1000
            }),
            notification: {
              type: 'success',
              text: 'The filter has been replaced.',
              sticky: false
            }
          }]
        }
      },
      fan: {
        min: 0,
        max: 2,
        default: 0,
        simulation: (latestValue, sensors) => (latestValue + 1) % 3,
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
          direction: 'left',
          input: true,
          actions: [{
            label: 'Trigger malfunction',
            name: 'malfunction',
            value: 'dust',
            socket: true,
            device: {
              ok: false,
              sensors: {
                dust: {
                  numericValue: -255
                }
              }
            }
          }]
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
            value: JSON.stringify({
              command: 'filter',
              option: 5
            }),
            notification: {
              type: 'error',
              text: 'This device’s filter is low. It should be replaced to ensure optimal air quality.',
              sticky: true
            }
          }, {
            label: 'Replace',
            value: JSON.stringify({
              command: 'filter',
              option: 1000
            }),
            notification: {
              type: 'success',
              text: 'The filter has been replaced.',
              sticky: false
            }
          }]
        }
      },
      fan: {
        min: 0,
        max: 2,
        default: 0,
        simulation: (latestValue, sensors) => (latestValue + 1) % 3,
        wiggle: false,
        widget: {
          name: 'fan-control',
          position: {
            top: 245,
            left: 820
          }
        }
      },
      display: {
        widget: {
          name: 'hvac-display',
          position: {
            top: 150,
            left: 350
          }
        }
      }
    }
  }
}

module.exports = config
