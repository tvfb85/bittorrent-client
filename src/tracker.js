'use strict';
const dgram = require('dgram');
const trackerParser = require('./trackerParser');
const trackerRequest = require('./trackerRequest');
const urlParse = require('url').parse;


module.exports.getPeers = (torrent, callback, socket = dgram.createSocket('udp4')) => {
  const url = torrent.announce.toString('utf8');
  const connectionReqMsg = trackerRequest.buildConnectionRequest();
  this.sendUdpMessage(socket, connectionReqMsg, url);

  socket.on('message', resp => {
    if (trackerParser.responseType(resp) === 'connect') {
      const connResp = trackerParser.parseConnectionResp(resp);
      const announceReqMsg = trackerRequest.buildAnnounceRequest(connResp.connectionID, torrent);
      this.sendUdpMessage(socket, announceReqMsg, url);
    } else {
      const announceResp = trackerParser.parseAnnounceResp(resp);
      callback(announceResp.peers);
    }
  });
};

module.exports.sendUdpMessage = (socket, message, rawUrl, callback = ()=>{}) => {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.hostname, callback);
};
