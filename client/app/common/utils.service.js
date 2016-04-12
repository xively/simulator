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
      let deferred = $q.defer()
      return function () {
        const callFunction = () => {
          deferred.resolve(func.apply(this, arguments))
          deferred = $q.defer()
        }
        const later = () => {
          timeout = null
          if (!immediate) {
            callFunction()
          }
        }
        if (immediate && !timeout) {
          callFunction()
        }
        if (timeout) {
          $timeout.cancel(timeout)
        }
        timeout = $timeout(later, wait)
        return deferred.promise
      }
    }
  }
}

module.exports = utilsFactory
