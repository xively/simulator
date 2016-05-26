const _ = require('lodash')

/* @ngInject */
function utilsFactory ($timeout, $q) {
  return {
    numberOrString (string) {
      const value = _.toNumber(string)
      if (!_.isNaN(value)) {
        return value
      }
      return string
    },

    debounce (func, wait, immediate) {
      let timeout
      return function () {
        return new $q((resolve, reject) => {
          const later = () => {
            timeout = null
            if (!immediate) {
              resolve(func.apply(this, arguments))
            }
          }

          const callNow = immediate && !timeout
          $timeout.cancel(timeout)
          timeout = $timeout(later, wait)

          if (callNow) {
            resolve(func.apply(this, arguments))
          }
        })
      }
    }
  }
}

module.exports = utilsFactory
