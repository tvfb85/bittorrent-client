'use strict';

const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');



module.exports.buildHandshake = (torrent) => {
  const buf = Buffer.alloc(68);
  buf.writeUInt8(19, 0); // pstrlen
  buf.write('BitTorrent protocol', 1);   // pstr
  buf.writeUInt32BE(0, 20);   // reserved
  buf.writeUInt32BE(0, 24);
  infoHash(torrent).copy(buf, 28);
  createPeerId().copy(buf, 48);
  return buf;
};

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
