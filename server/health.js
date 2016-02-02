'use strict';

var router = require('express').Router;

module.exports = function() {
  var app = router();

  app.get('/isalive', function(req, res) {
    res.send(200, 'YESOK');
  });

  return app;
};
