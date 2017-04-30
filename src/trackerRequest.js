'use strict';

const Buffer = require('buffer').Buffer;
const crypto = require('crypto');
const torrentParser = require('./torrentParser');
const message = require('./message');


module.exports.buildConnectionRequest = () => {

  const buffer = Buffer.alloc(16);
  buffer.writeUInt32BE(0x417, 0);
  buffer.writeUInt32BE(0x27101980, 4);
  buffer.writeUInt32BE(0, 8);
  crypto.randomBytes(4).copy(buffer, 12);
  return buffer;
};

module.exports.buildAnnounceRequest = (connectionId, torrent) => {

  const buffer = Buffer.alloc(98);
  connectionId.copy(buffer, 0);
  buffer.writeUInt32BE(1, 8);
  crypto.randomBytes(4).copy(buffer, 12);
  torrentParser.infoHash(torrent).copy(buffer, 16);
  message.createPeerId().copy(buffer, 36);
  // leave 8 bytes as 0 to indicate amount downloaded
  torrentParser.size(torrent).copy(buffer, 64);
  // leave 8 bytes as 0 to indicate amount uploaded
  // leave 4 bytes as 0 to indicate unspecified event
  // leave 4 bytes as 0 to indicate unspecified IP address
  crypto.randomBytes(4).copy(buffer, 88);

  return buffer;
};
