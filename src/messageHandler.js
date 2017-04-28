'use strict';

const messageParser = require('./messageParser');
const message = require('./message');
const connect = require('./connect');
const fs = require('fs');

module.exports.handle = (msg, socket, file, pieces, queue, torrent) => {
  console.log('1');
  if (messageParser.isHandshake(msg)) {
    console.log('3 - handshake')
    socket.write(message.buildInterested());
  } else {
    console.log('5')
    const parsedMsg = messageParser.parse(msg);
    if (parsedMsg.id === 1) {this.unchokeHandler(socket, pieces, queue)}
    if (parsedMsg.id === 7) {this.pieceHandler(file, parsedMsg.payload, torrent)}
  }
};

module.exports.unchokeHandler = (socket, pieces, queue) => {
  connect.requestPiece(socket, pieces, queue);
};

module.exports.pieceHandler = (file, pieceData, torrent) => {
  const offset = pieceData.index * torrent.info['piece length'] + pieceData.begin;
  fs.write(file, pieceData.block, 0, pieceData.block.length, offset,() => {});
};
