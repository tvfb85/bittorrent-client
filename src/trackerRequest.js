'use strict';

const Buffer = require('buffer').Buffer;
const crypto = require('crypto');

module.exports.buildConnectionRequest = () => {

  const buffer = Buffer.alloc(16);
  buffer.writeUInt32BE(0x417, 0);
  buffer.writeUInt32BE(0x27101980, 4);
  buffer.writeUInt32BE(0, 8);
  crypto.randomBytes(4).copy(buffer, 12);
  return buffer;
};
