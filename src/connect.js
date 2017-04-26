'use strict'
const net = require('net');

module.exports = peer => {
  const socket = new net.Socket()
  socket.connect(peer.port, peer.ip);
  socket.on('data', console.log);
}
