'use strict';

// The properties that our sensors can, well, sense. Includes
// their min and max, and the initial value. Filter isn't here,
// as that's not a value that is measured by our sensors.
var sensorProps = {
  temp: {
    min: -40,
    max: 125,
    initial: 26,
    wiggle: true,
  },
  humidity: {
    min: 0,
    max: 100,
    initial: 20,
    wiggle: true,
  },
  no2: {
    min: 0,
    max: 150,
    initial: 25,
    wiggle: true,
  },
  co: {
    min: 0,
    max: 500,
    initial: 25,
    wiggle: true,
  },
  dust: {
    min: 0,
    max: 500,
    initial: 100,
    wiggle: true,
  },

  // Not technically a "sensor," but the rest of the application
  // doesn't differentiate them. So neither will I.
  filter: {
    min: 0,
    max: 1000,
    initial: 1000,
    wiggle: false,
  },

  // Like the filter, this also isn't technically a sensor. But it behaves
  // very similarly, so it's worth displaying.
  fan: {
    min: 0,
    max: 2,
    initial: 0,
    map: ['off', 'low', 'high'],
    wiggle: false,
  },
};

module.exports = sensorProps;
