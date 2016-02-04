/* eslint eqeqeq:0 */
'use strict';

// A UUID generator that's sufficiently random enough for our needs. Although it depends on the Math.random()
// implementation, we won't be generating millions of these, or anything, so it's not a problem even if the underlying
// Math.random() algorithm isn't all that good.
// Plucked from this fine SO answer: http://stackoverflow.com/a/2117523/1727181
module.exports = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
