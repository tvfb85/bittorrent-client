'use strict';

const messageParser = require('./messageParser');
const message = require('./message');
const connect = require('./connect');

module.exports.handle = (msg, socket) => {
  if (messageParser.isHandshake(msg)) {
    socket.write(message.buildInterested());
  } else {
    const parsedMsg = messageParser.parse(msg);
    if (parsedMsg.id === 2) {this.unchokeHandler(socket)}
    if (parsedMsg.id === 7) {this.pieceHandler(socket, parsedMsg.payload)}
  }
};

module.exports.unchokeHandler = (download) => {
  connect.requestPiece(download);
};

module.exports.pieceHandler = () => {

};
