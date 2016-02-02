'use strict';

module.exports = {
  level: {
    good: {
      color: '#008000',
      label: 'Good',
      threshold: 50,
      level: 1,
    },
    moderate: {
      color: '#ffff00',
      label: 'Moderate',
      threshold: 100,
      level: 2,
    },
    usg: {
      color: '#ffa500',
      label: 'Unhealthy for Sensitive Groups',
      threshold: 150,
      level: 3,
    },
    unhealthy: {
      color: '#ff0000',
      label: 'Unhealthy',
      threshold: 200,
      level: 4,
    },
    veryUnhealthy: {
      color: '#800080',
      label: 'Very Unhealthy',
      threshold: 300,
      level: 5,
    },
    hazardous: {
      color: '#800000',
      label: 'Hazardous',
      threshold: 500,
      level: 6,
    },
  },
  labelMap: {
    1: 'good',
    2: 'moderate',
    3: 'usg',
    4: 'unhealthy',
    5: 'veryUnhealthy',
    6: 'hazardous',
  },
};