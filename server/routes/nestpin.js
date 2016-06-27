'use strict'
const request = require('request-promise')

module.exports = (req, res) => {
  request({
    uri: 'https://api.home.nest.com/oauth2/access_token',
    method: 'POST',
    form: req.body
  }).then((loginResult) => {
    res.status(200).send(loginResult)
  }).catch((error) => {
    res.status(500).send(error.response)
  })
}
