'use strict';

// This manages publishing updates on the MQTT channel
var mqttSensorPublisher = [
  'sensorProps', 'sensorStore', 'csvParse', 'mqttService',
  function(sensorProps, sensorStore, csvParse, mqttService) {

    // Returns the fourth argument of a given property
    // and value in the sensorStore
    function getFourthArg(prop, val) {
      if (prop !== 'fan') {
        return null;
      }
      return sensorProps.fan.map[val];
    }

    return {
      // props are an array of sensor names to be sent.
      // Passing `undefined` will send a complete update.
      publishUpdate: function(props, channel) {
        props = props || [];
        var validProps = Object.keys(sensorProps);
        // Filter by just those property names that are valid
        props = props.filter(function(prop) {
          return validProps.indexOf(prop) !== -1;
        });
        // If our props are empty, then we're sending a complete update
        if (!props.length) {
          props = validProps;
        }
        // Create our update
        var update = props.reduce(function(memo, prop) {
          var val = sensorStore.get(prop);
          var child = [null, prop, val, getFourthArg(prop, val)];
          memo.push(child);
          return memo;
        }, []);
        update = csvParse.serialize(update);
        mqttService.sendMessage(update, channel);
      },
    };
  }];

module.exports = mqttSensorPublisher;
