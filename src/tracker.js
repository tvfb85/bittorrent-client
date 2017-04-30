'use strict';
const dgram = require('dgram');

module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
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
  })
}
