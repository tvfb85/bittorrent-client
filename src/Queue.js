'use strict';

module.exports = class {
  constructor(torrent) {
    this._queue = [];
    this._torrent = torrent;
  }

  addToQueue(pieceIndex) {
    const piece = {
      index: pieceIndex
    }
    this._queue.push(piece);
  }

}
