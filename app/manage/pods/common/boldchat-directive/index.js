'use strict';

module.exports = [
  '$interval',
  function($interval) {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      link: function(scope, el) {
        // An interval is necessary here because of the Boldchat API,
        // which dynamically injects a pretty bad image. Different computers
        // take a different amount of time to execute that JavaScript and insert
        // the image, so we periodically check to see if it's done. And, in the event
        // that it never resolves, we limit the interval to 1000 checks so that we're
        // not polling indefinitely.
        var stop = $interval(function() {
          var $img = el.find('img');
          if (!$img.length) {
            return;
          }
          $interval.cancel(stop);
          // This template string could go in a separate file, but it's relatively small so I opted to inline it.
          // If we decide to add much more to it, then it should prob. be externalized.
          el.find('a').append('<span><i class="fa fa-commenting-o"></i> Contact a Representative</span>');
        }, 50, 1000);
      }
    };
  },
];
