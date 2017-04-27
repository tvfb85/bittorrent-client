'use strict'
const net = require('net');

module.exports = (peer, socket = new net.Socket()) => {
  socket.connect(peer.port, peer.ip, () => {
    socket.write('hello');
  });
  socket.on('data', console.log);
}
