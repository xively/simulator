'use strict'

function promiseDebounce (func, wait, immediate) {
  let timeout
  return function () {
    return new Promise((resolve, reject) => {
      const later = () => {
        timeout = null
        if (!immediate) {
          resolve(func.apply(this, arguments))
        }
      }

      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)

      if (callNow) {
        resolve(func.apply(this, arguments))
      }
    })
  }
}

module.exports = promiseDebounce
