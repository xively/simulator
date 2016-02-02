'use strict';

var Promise = require('bluebird');

var slice = function(ary) {
  return Array.prototype.slice.call(ary);
};

/**
 * resolveArgs
 * wrap a function so that arguments passed when called are resolved before calling the internal function
 *
 * @param {Object} options
 *   - $scope {Object} angular scope object to apply around function allowing scope changes to be recognized
 *   - $scopeIndex {Number} index of arguments to use as the $scope object
 *   - indices {Array} indices of arguments to resolve, not all promises need to be resolved just the
 *     ones specified
 * @param {Function} fn function to call once args are resolved
 * @returns {Function} function that calls wrapped function once promises resolve
 */
var resolveArgs = function(options, fn) {
  return function() {
    var args = slice(arguments);
    var argsIndices = options.indices;
    return Promise
    .all(argsIndices.map(function(index) { return args[index]; }))
    .then(function(resolvedArgs) {
      argsIndices.forEach(function(targetIndex, index) {
        args[targetIndex] = resolvedArgs[index];
      });
      var scope = options.$scope;
      if (typeof options.$scopeIndex !== 'undefined') {
        scope = args[options.$scopeIndex];
      }
      if (scope) {
        return scope.$apply(function() { return fn.apply(null, args); });
      }
      return fn.apply(null, args);
    });
  };
};

module.exports = resolveArgs;
