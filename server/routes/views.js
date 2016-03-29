'use strict';

const config = require('../config');

var habanero = require('../vendor/habanero');

function main(req, res) {
  res.redirect(`/manage/#/device/${config.virtualdevice.mqtt.deviceId}?demo=1`);
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

function gotoHabanero(req, res) {
  habanero.login(req, res);
}

module.exports = {
  main,
  virtualDevice,
  manage,
  gotoHabanero
};
