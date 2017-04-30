'use strict';

const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');

module.exports.open = torrentFilepath => {
  return bencode.decode(fs.readFileSync(torrentFilepath));
};

module.exports.infoHash = torrent => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
}
