'use strict'

const cloudinary = require('cloudinary')

function upload (image) {
  return new Promise((resolve, reject) => {
    if (!image) {
      return reject(new Error('Missing required parameter: image'))
    }

    cloudinary.uploader.upload(image, (result) => {
      resolve(result)
    })
  })
}

module.exports = {
  upload
}
