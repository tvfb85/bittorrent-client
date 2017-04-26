'use strict';

module.exports.isHandshake = (message) => {
  return message.length === 68 &&
         message.toString('utf8', 1, 20) === 'BitTorrent protocol';
};

module.exports.parse = (message) => {
  const msgId = message.readInt8(4);
  let payload = null;
  if (message.length > 5) {
    payload = {
      index: message.readInt32BE(5),
      begin: message.readInt32BE(9)
    };
    payload[msgId === 7 ? 'block' : 'length'] = message.slice(13);
  }
  return {
    size : message.readInt32BE(0),
    id : msgId,
    payload : payload
  };
};
