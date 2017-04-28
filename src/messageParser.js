'use strict';

module.exports.isHandshake = (message) => {
  console.log('2');
  return message.length === 68 &&
         message.toString('utf8', 1, 20) === 'BitTorrent protocol';
};

module.exports.parse = (message) => {
  console.log('6')
  const msgId = message.readInt8(4);
  let payload = null;
  if (message.length > 5 && msgId != 4 && msgId != 5) {
    console.log('dont get me!')
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
