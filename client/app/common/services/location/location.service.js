const _ = require('lodash')
const geojsonUtils = require('geojson-utils')
const geojsonExtent = require('geojson-extent')
const geojsonRandom = require('geojson-random')
const map = require('json!./map.json')

/* @ngInject */
function locationFactory () {
  return {
    generateLocation () {
      const feature = _.sample(map.features)
      const bbox = geojsonExtent(feature)
      const coordinates = geojsonRandom.position(bbox)
      if (geojsonUtils.pointInMultiPolygon({ coordinates }, feature.geometry)) {
        return coordinates
      }
      return this.generateLocation()
    }
  }
}

module.exports = locationFactory
