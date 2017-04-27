'use strict';

const messageParser = require('../src/messageParser');
const net = require('net');

module.exports.handle = (message, socket) => {
  if (messageParser.isHandshake(message)) {
    socket.write(message);
  }
};
