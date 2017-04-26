'use strict';

module.exports.isHandshake = (message) => {
  return message.length === 68 &&
         message.toString('utf8', 1, 20) === 'BitTorrent protocol';
};
