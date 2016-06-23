const isProd = window.APP_CONFIG.meta.env === 'production'

const segmentConfig = {
  apiKey: isProd ? window.APP_CONFIG.tracking.segmentKeyProd : window.APP_CONFIG.tracking.segmentKeyDev
}

module.exports = segmentConfig
