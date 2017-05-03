'use strict';

const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');
const torrentParser = require('./torrentParser');


module.exports.buildHandshake = (torrent) => {
  const buffer = Buffer.alloc(68);
  buffer.writeUInt8(19, 0); // pstrlen
  buffer.write('BitTorrent protocol', 1);   // pstr
  buffer.writeUInt32BE(0, 20);   // reserved
  buffer.writeUInt32BE(0, 24);
  torrentParser.infoHash(torrent).copy(buffer, 28);
  this.createPeerId().copy(buffer, 48);
  return buffer;
};

module.exports.buildInterested = () => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(2, 4);
  return buffer;
};

module.exports.buildUnchoke = () => {
  const buf = Buffer.alloc(5);
  // length
  buf.writeUInt32BE(1, 0);
  // id
  buf.writeUInt8(1, 4);
  return buf;
};

module.exports.buildHave = payload => {
  const buf = Buffer.alloc(9);
  // length
  buf.writeUInt32BE(5, 0);
  // id
  buf.writeUInt8(4, 4);
  // piece index
  buf.writeUInt32BE(payload, 5);
  return buf;
};

module.exports.buildRequest = (payload) => {
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(6, 4);
  buffer.writeUInt32BE(payload.index, 5);
  buffer.writeUInt32BE(payload.begin, 9);
  buffer.writeUInt32BE(payload.pieceLength, 13);
  return buffer;
}

module.exports.buildPiece = payload => {
  const buf = Buffer.alloc(payload.length.length + 13);
  // length
  buf.writeUInt32BE(payload.length.length + 9, 0);
  // id
  buf.writeUInt8(7, 4);
  // piece index
  buf.writeUInt32BE(payload.index, 5);
  // begin
  buf.writeUInt32BE(payload.begin, 9);
  // block
  payload.length.copy(buf, 13);
  return buf;
};


module.exports.createPeerId = () => {
  let id = null;

  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-NVNF01-').copy(id, 0);
  }

  return id;
};
