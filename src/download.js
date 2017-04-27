'use strict';

const Pieces = require('./Pieces.js')
const Queue = require('./Queue.js')

module.exports = (torrent) => {
  const pieces = new Pieces(torrent);
  const queue = new Queue(torrent);
  return addAllPiecesToQueue(torrent, queue);
};

function addAllPiecesToQueue (torrent, queue) {
  const numberPieces = Math.ceil(torrent.info.length / torrent.info["piece length"]);
  for(let i = 0; i < numberPieces; i++) {
    queue.addToQueue(i);
  }
  return queue._queue;
}
