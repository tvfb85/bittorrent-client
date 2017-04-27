'use strict'
const net = require('net');
const messageParser = require('./messageParser');

module.exports = (peer, socket = new net.Socket()) => {
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write('hello');
  });
  socket.on('data', console.log);
}

module.exports.dataHandler = (data, callback) => {
  let handshake = true;
  // to do: delet this
  let newbuffer = Buffer.alloc(0);
  let foo = Buffer.concat([newbuffer, data])
  callback(data);
  handshake = false;
};
