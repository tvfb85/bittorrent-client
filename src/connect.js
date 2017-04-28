'use strict';
const net = require('net');
const messageParser = require('./messageParser');

module.exports = (peer, socket = new net.Socket()) => {
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write('hello');
  });
  dataHandler(socket, wholeMsg => messageHandler(wholeMsg, socket))
}

function dataHandler(socket, callback) {
  let handshake = true;
  let newBuffer = Buffer.alloc(0);

  socket.on('data', data => {
    let msgLen = getExpectedMessageLength()
    newBuffer = Buffer.concat([newbuffer, data])

    while (isWholeMessage(newBuffer, msgLen)) {
      callback(newBuffer.slice(0, msgLen));
      newBuffer = newBuffer.slice(msgLen);
      handshake = false;
    }
  });
};

function getExpectedMessageLength(message, handshake) {
  const handshakeLength = message.readUInt8(0) + 49;
  const nonHandshakeLength = message.readInt32BE(0) + 4;
  return handshake ? handshakeLength : nonHandshakeLength;
}

function isWholeMessage(data, expectedLength) {
  return data.length >= 4 && data.length >= expectedLength;
}

module.exports.requestPiece = (socket, pieces, queue) => {
  while (queue.length()) {
    let piece = queue.removeFromQueue();
    if (pieces.needed(piece)) {
      pieces.addRequested(piece);
      break;
    }
  }
};

module.exports.dataHandler = dataHandler;
module.exports.getExpectedMessageLength = getExpectedMessageLength;
module.exports.isWholeMessage = isWholeMessage;
