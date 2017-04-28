'use strict';

const Pieces = require('./Pieces.js');
const Queue = require('./Queue.js');
const connect = require('./connect.js');
const peer = require('./peer.js');


module.exports = class {
  constructor(torrent) {
    this.torrent = torrent;
    this.pieces = new Pieces(torrent);
    this.queue = new Queue(torrent);
    this.addAllPiecesToQueue(torrent);
  }

  addAllPiecesToQueue () {
    const numberPieces = Math.ceil(this.torrent.info.length / this.torrent.info["piece length"]);
    for(let i = 0; i < numberPieces; i++) {
      this.queue.addToQueue(i);
    }
  }

  start () {
    connect(peer, this.torrent);
  }
};
