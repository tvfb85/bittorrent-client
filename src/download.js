'use strict';

const Pieces = require('./Pieces.js')

module.exports = (torrent) => {
  const pieces = new Pieces(torrent);
};
