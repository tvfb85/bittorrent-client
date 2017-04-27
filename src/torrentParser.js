'use strict';

const fs = require('fs');
const bencode = require('bencode');

module.exports.open = torrentFilepath => {
  return bencode.decode(fs.readFileSync(torrentFilepath));
};
