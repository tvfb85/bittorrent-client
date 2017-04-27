'use strict';

const Queue = require('../src/Queue');

describe('Queue', () => {

  const torrent = {
    info: {
      length: 1277987,
      name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
      'piece length': 16384,
      pieces: '<Buffer >'
    }
  };

  const pieceIndex = 7;
  let queue;

  beforeEach( () => {
    queue = new Queue(torrent);
  });

  it('has an empty queue initially', () => {
    expect(queue._queue.length).toEqual(0);
  });

  it('saves the torrent', () => {
    expect(queue._torrent).toEqual(torrent);
  });

  it('adds pieces to the queue', () => {
    queue.addToQueue(pieceIndex);
    expect(queue._queue[0].index).toEqual(pieceIndex);
  });

  it('saves the begin index of the piece', () => {
    queue.addToQueue(pieceIndex);
    expect(queue._queue[0].begin).toEqual(0);
  });

  it('saves the length of the piece', () => {
    queue.addToQueue(pieceIndex);
    expect(queue._queue[0].pieceLength).toEqual(torrent.info['piece length']);
  });

  it('removes the first piece from the queue', () => {
    queue.addToQueue(pieceIndex);
    queue.removeFromQueue();
    expect(queue._queue.length).toEqual(0);
  })

});
