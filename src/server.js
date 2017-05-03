'use strict';
const fs = require('fs');
const net = require('net');
const message = require('./message')
const Pieces = require('./Pieces');
const messageParser = require('./messageParser')
const connection = require('./connection')

module.exports.startServer = (torrent) => {
    const server = net.createServer(function(socket) {
    connection.connectors.dataHandler(socket, msg => module.exports.leechHandler(msg, socket, torrent));
  });
  server.listen(6881);
}

module.exports.leechHandler = (msg, socket, torrent) => {
  if (messageParser.isHandshake(msg)) {
    socket.write(message.buildHandshake(torrent));
  } else {
    const parsedMsg = messageParser.parse(msg);
    if (parsedMsg.id === 2) module.exports.sendHaveMessages(socket, torrent, parsedMsg.payload);
    if (parsedMsg.id === 6) module.exports.requestHandler(socket, torrent, parsedMsg.payload)
  }
}

module.exports.sendHaveMessages = (socket, torrent, msg) => {
  console.log('sending the have messages')
  const pieces = new Pieces(torrent);
  const nPieces = pieces._requested;
  nPieces.forEach((piece, index) => socket.write(message.buildHave(index)));
  socket.write(message.buildUnchoke());
}

module.exports.requestHandler = (socket, torrent, msg) => {
  const openFile = fs.openSync('./flag.jpg', 'r');
  let buffer = Buffer.alloc(torrent.info['piece length']);
  let position = (msg.index) * 16384;
  fs.read(openFile, buffer, 0, 16384, position, (err, bytesRead, buffer) => {
    const piece = {
      index: msg.index,
      begin: msg.begin,
      block: buffer
    };
    socket.write(message.buildPiece(piece));
  });
}
