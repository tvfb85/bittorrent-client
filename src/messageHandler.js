'use strict';

const messageParser = require('./messageParser');
const message = require('./message');
const connect = require('./connect');

module.exports.handle = (msg, socket, pieces, queue) => {
  if (messageParser.isHandshake(msg)) {
    socket.write(message.buildInterested());
  } else {
    const parsedMsg = messageParser.parse(msg);
    if (parsedMsg.id === 2) {this.unchokeHandler(socket, pieces, queue)}
    if (parsedMsg.id === 7) {this.pieceHandler(socket, parsedMsg.payload)}
  }
};

module.exports.unchokeHandler = (socket, pieces, queue) => {
  connect.requestPiece(socket, pieces, queue);
};

module.exports.pieceHandler = () => {

};
