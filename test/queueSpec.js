'use strict';

const Queue = require('../src/Queue');

describe('Queue', () => {

  const torrent = {
    info: {
      Dict: {
        length: 1277987,
        name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
        'piece length': 16384,
        pieces: '<Buffer >'
      }
    }
  }
  const queue = new Queue(torrent);
  const pieceIndex = 7

  it('has an empty queue initially', () => {
    expect(queue._queue.length).toEqual(0);
  })

  it('saves the torrent', () => {
    expect(queue._torrent).toEqual(torrent);
  })

  it('adds pieces to the queue', () => {
    queue.addToQueue(pieceIndex);
    expect(queue._queue[0].index).toEqual(pieceIndex);
  })

});
