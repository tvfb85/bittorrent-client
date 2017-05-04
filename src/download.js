'use strict';

const Pieces = require('./Pieces.js');
const Queue = require('./Queue.js');
const tracker = require('./tracker.js');
const connection = require('./connection.js');
const fs = require('fs');
const server = require('./server')

module.exports = class {
  constructor(torrent, path) {
    this.torrent = torrent;
    this.pieces = new Pieces(torrent);
    this.queue = new Queue(torrent);
    this.file = fs.openSync(path, 'w');
    this.addAllPiecesToQueue(torrent);
  }

  addAllPiecesToQueue (torrent) {
    const numberPieces = Math.ceil(this.torrent.info.length / this.torrent.info["piece length"]);
    for(let i = 0; i < numberPieces; i++) {
      this.queue.addToQueue(i);
    }
  }

  start () {
    server.startServer(this.torrent);
    tracker.getPeers(this.torrent, peers => {
      peers.forEach(peer => {
        connection.make(peer, this.torrent, this.pieces, this.queue, this.file);
      });
    });
  }
};
