'use strict'

function promiseDebounce (func, wait, immidiate) {
  let timeout
  return function () {
    return new Promise((resolve, reject) => {
      const later = () => {
        timeout = null
        if (!immidiate) {
          resolve(func.apply(this, arguments))
        }
      }

      const callNow = immidiate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)

      if (callNow) {
        resolve(func.apply(this, arguments))
      }
    })
  }
}

module.exports = promiseDebounce
