'use strict';

const config = require('../config');

function main(req, res) {
  res.render('server-index', {
    config
  });
}

function virtualDevice(req, res) {
  res.render('virtual-device', {
    config
  });
}

function manage(req, res) {
  res.render('manage', {
    config
  });
}

module.exports = {
  main,
  virtualDevice,
  manage
};
