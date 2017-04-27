'use strict';

const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');



module.exports.buildHandshake = (torrent) => {
  const buffer = Buffer.alloc(68);
  buffer.writeUInt8(19, 0); // pstrlen
  buffer.write('BitTorrent protocol', 1);   // pstr
  buffer.writeUInt32BE(0, 20);   // reserved
  buffer.writeUInt32BE(0, 24);
  infoHash(torrent).copy(buffer, 28);
  createPeerId().copy(buffer, 48);
  return buffer;
};

module.exports.buildInterested = () => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(2, 4);
  return buffer;
};

module.exports.buildRequest = (payload) => {
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(6, 4);
  buffer.writeUInt32BE(payload.index, 5);
  buffer.writeUInt32BE(payload.begin, 9);
  buffer.writeUInt32BE(payload.length, 13);
  return buffer;
}

function infoHash(torrent) {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
}

function createPeerId() {
  let id = null;

  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-NVNF01-').copy(id, 0);
  }

  return id;
};
