'use strict';

const messageParser = require('./messageParser');
const net = require('net');
const message = require('./message');

module.exports.handle = (msg, socket) => {
  if (messageParser.isHandshake(msg)) {
    socket.write(message.buildInterested());
  }
};
