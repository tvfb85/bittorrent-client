'use strict';
const dgram = require('dgram');
const trackerParser = require('./trackerParser');
const trackerRequest = require('./trackerRequest');
const urlParse = require('url').parse;


module.exports.getPeers = (torrent, socket = dgram.createSocket('udp4'), callback) => {
  const url = torrent.announce.toString('utf8');
  const message = trackerRequest.buildConnectionRequest();

  this.sendUdpMessage(socket, message, url);

  socket.on('message', resp => {
    if (trackerParser.responseType(resp) === 'connect') {
      const connResp = trackerParser.parseConnectionResp(resp);
      // build AnnounceRequestMessage
      // send AnnounceRequestMessage
    } else {
      const announceResp = trackerParser.parseAnnounceResp(resp);
      callback(announceResp.peers);
    }
  });
};

module.exports.sendUdpMessage = (socket, message, rawUrl, callback = ()=>{}) => {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
};
