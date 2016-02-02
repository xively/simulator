'use strict';

// These utilities provide methods to serialize
// a JS object into the CSV format we need for MQTT, and back again.
var csvParse = {

  // Transforms a JavaScript Object into the CVS payload format.
  // For example:
  // [
  //   [undefined, temp, 70, undefined],
  //   [undefined, fan, 1, low]
  // ]
  //
  // would become
  //
  // ,temp,70,
  // ,fan,1,low
  serialize: function(arr) {
    if (!arr || !arr.length) { return ''; }

    arr = arr.map(function(child) {
      return child.join(',');
    });

    return arr.join('\n');
  },
};

module.exports = csvParse;
