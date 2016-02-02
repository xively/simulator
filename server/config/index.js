'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var readConfig = function(file) {
  var key = path.basename(file, '.json');
  var obj = {};
  obj[key] = JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf8'));
  return obj;
};

var processEnvVariables = function(env) {
  var walk = function(value, key, obj) {
    if (typeof value === 'string' && value.indexOf('$') !== -1) {
      // Process value as a lodash template.
      obj[key] = _.template(obj[key])(env);
    }
    else if (typeof value === 'object') {
      _.each(value, walk);
    }
  };
  return walk;
};

/**
 * Load configuration from listed files and replace with environment variables.
 *
 * @param {Object} options
 *   - {Object} env environment object containing values to fill configuration
 *   - {Array} files list of files to load into the configuration, they can be
 *     relative paths to the config folder
 * @returns {Object} configuration object filled with keys belonging to the
 *   names of the files passed in
 **/
exports.load = function(options) {
  // Build a fresh config object with keys being the file names.
  var config = _(options.files).map(readConfig).reduce(_.merge);
  // Promote any $VARNAME vars to their corresponding values.
  processEnvVariables(options.env)(config);
  return config;
};
