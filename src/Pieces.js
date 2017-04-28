'use strict'

module.exports = class {
  constructor(torrent) {
    function buildPiecesArray() {
      const numberOfPieces = Math.ceil(torrent.info.pieces.length / 20);
      return new Array(numberOfPieces).fill(false);
      // TO DO: calculate blocks per piece
    }
    this._requested = buildPiecesArray();
  };
  isComplete() {

  };
};
