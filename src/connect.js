'use strict';

const fs = require('fs');
const net = require('net');
const messageParser = require('./messageParser');
const message = require('./message');

module.exports = (peer, torrent, pieces, queue, file, socket = new net.Socket()) => {
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write(message.buildHandshake(torrent));
  });
  dataHandler(socket, wholeMsg => module.exports.handlers.handle(wholeMsg, socket, file, pieces, queue, torrent))
};

function dataHandler(socket, callback) {
  let handshake = true;
  let newBuffer = Buffer.alloc(0);
  socket.on('data', data => {
    let msgLen = () => { return getExpectedMessageLength(newBuffer, handshake); };
    newBuffer = Buffer.concat([newBuffer, data]);
    while (isWholeMessage(newBuffer, msgLen)) {
      callback(newBuffer.slice(0, msgLen()));
      newBuffer = newBuffer.slice(msgLen());
      handshake = false;
    }
  });
};

function getExpectedMessageLength(message, handshake) {
  const handshakeLength = message.readUInt8(0) + 49;
  const nonHandshakeLength = message.readInt32BE(0) + 4;
  return handshake ? handshakeLength : nonHandshakeLength;
};

function isWholeMessage(data, expectedLength) {
  return data.length >= 4 && data.length >= expectedLength(data);
};

function requestPiece(socket, pieces, queue) {
  while (queue.length()) {
    let piece = queue.removeFromQueue();
    if (pieces.needed(piece)) {
      socket.write(message.buildRequest(piece));
      pieces.addRequested(piece);
      break;
    }
  }
};

function handle(msg, socket, file, pieces, queue, torrent) {
  if (messageParser.isHandshake(msg)) {
    socket.write(message.buildInterested());
  } else {
    const parsedMsg = messageParser.parse(msg);
    if (parsedMsg.id === 1) {this.unchokeHandler(socket, pieces, queue)}
    if (parsedMsg.id === 7) {
      this.pieceHandler(file, parsedMsg.payload, torrent, socket, pieces, queue)}
  }
};

function unchokeHandler(socket, pieces, queue) {
  module.exports.connectors.requestPiece(socket, pieces, queue);
};

function pieceHandler(file, pieceData, torrent, socket, pieces, queue) {
  const offset = pieceData.index * torrent.info['piece length'] + pieceData.begin;
  fs.write(file, pieceData.block, 0, pieceData.block.length, offset,() => {});
  if (pieces.isComplete()) {
    socket.end();
    try { fs.closeSync(file); } catch(e) { }
  } else {
    module.exports.connectors.requestPiece(socket, pieces, queue)
  }
};

module.exports.connectors = {
  dataHandler: dataHandler,
  getExpectedMessageLength: getExpectedMessageLength,
  isWholeMessage: isWholeMessage,
  requestPiece: requestPiece
};

module.exports.handlers = {
  handle: handle,
  unchokeHandler: unchokeHandler,
  pieceHandler: pieceHandler
};
