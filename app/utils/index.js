'use strict';

function getLogChannel(device) {
  return 'xi/blue/v1/' + device.accountId + '/d/' + device.id + '/_log';
}

module.exports = {
  getLogChannel: getLogChannel
};
