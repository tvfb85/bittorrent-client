'use strict'
const net = require('net');

module.exports = (peer, socket = new net.Socket()) => {
  socket.on('data', console.log);
}
