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

const config = {
  hiddenChannels: ['sensor', 'control'],
  deviceInfoFields: ['version', 'serialNumber', 'firmwareVersion', 'latitude', 'longitude', 'externalIp', 'color',
    'productionRun', 'hardwareVersion', 'activatedDate', 'powerVersion', 'name', 'purchaseDate', 'location'],
  widgets: [],
  'Cast Member Badge': {
    image: '/devices/images/Disney_Badge.png',
    width: 680,
    sensors: {
      'checkin': {
        min: 0,
        max: 1,
        default: 0,
        wiggle: false,
        widget: {
          name: 'badge-button',
          options: {
            toggleColor: 'green',
            label: 'Check in'
          },
          position: {
            top: 280,
            left: 75
          }
        }
      },
      'replenishment_request': {
        min: 0,
        max: 1,
        default: 0,
        wiggle: false,
        widget: {
          name: 'badge-button',
          options: {
            toggleColor: 'green',
            label: 'Request replenishment'
          },
          position: {
            top: 310,
            left: 280
          }
        }
      },
      'emergency': {
        min: 0,
        max: 1,
        default: 0,
        wiggle: false,
        widget: {
          name: 'badge-button',
          options: {
            toggleColor: 'red',
            label: 'Emergency'
          },
          position: {
            top: 280,
            left: 475
          }
        }
      }
    }
  }
}

module.exports = config
