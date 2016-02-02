'use strict';

module.exports = {
  fan: {
    connectionState: {
      connected: 'connected',
      disconnected: 'disconnected',
    },
    state: {
      on: 'on',
      off: 'off',
    },
    speed: [
      'off',
      'low',
      'high',
    ],
  },
  sensorList: {
    temp: 'temp',
    humidity: 'humidity',
    co: 'co',
    dust: 'dust',
    filter: 'filter',
    fan: 'fan',
  },
  command: {
    speed: {
      off: 'OFF',
      low: 'LOW',
      high: 'HIGH',
    },
  },
};