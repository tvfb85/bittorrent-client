'use strict';
const dgram = require('dgram');
const tracker = require('../src/tracker');

describe('Tracker', () => {

  let torrent = {
    announce: {
      toString: () => {}
    }
  }

  it('should be defined', () => {
    const torrentAnnounce = spyOn(torrent.announce, 'toString');
    const socketSpy = spyOn(dgram, 'createSocket').andCallThrough();

    tracker.getPeers(torrent)
    expect(torrentAnnounce).toHaveBeenCalledWith('utf8')
    expect(socketSpy).toHaveBeenCalledWith('udp4');
  })

})
