'use strict';
const dgram = require('dgram');
const trackerParser = require('./trackerParser');

module.exports.getPeers = (torrent, socket = dgram.createSocket('udp4'), callback) => {
  const url = torrent.announce.toString('utf8');

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
}
