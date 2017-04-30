'use strict';

const torrentParser = require('../src/torrentParser');

describe('Tracker requests', () => {

  const trackerRequest = require('../src/trackerRequest');

  describe('Connect request', () => {

    let connectionRequest;
    const connectionId = 0x41727101980.toString(16);

    beforeEach(() => {
      connectionRequest = trackerRequest.buildConnectionRequest();
      console.log(connectionRequest.slice(0, 4).toString('utf8'));
    });

    it('has a length of 16', () => {
      expect(connectionRequest.length).toEqual(16);
    });

    it('has the correct connection id', () => {
      const id = connectionRequest.readUInt32BE(0).toString(16) + connectionRequest.readUInt32BE(4).toString(16);
      expect(id).toEqual(connectionId);
    });

    it('has an action of 0', () => {
      expect(connectionRequest.readUInt32BE(8)).toEqual(0);
    });

    it('has a transaction id of 4 random bytes', () => {
      expect(connectionRequest.readUInt32BE(12)).not.toEqual(0);
    });
  });

  describe('Announce request', () => {

    let announceRequest;
    const connectionId = Buffer.alloc(8);
    connectionId.writeUInt32BE(1234, 0);
    connectionId.writeUInt32BE(5678, 4);
    let torrent;

    beforeEach(() => {
      torrent = {
        info: {
          Dict: {
            length: 1277987,
            name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
            'piece length': 16384,
            pieces: '<Buffer >'
          }
        }
      }
      announceRequest = trackerRequest.buildAnnounceRequest(connectionId, torrent);
    })

    it('has a length of 98', () => {
      expect(announceRequest.length).toEqual(98);
    })

    it('saves a connection id to the buffer', () => {
      expect(announceRequest.slice(0, 8).toString('utf8')).toEqual(connectionId.toString('utf8'));
    })

    it('has an action 1', () => {
      expect(announceRequest.readUInt32BE(8)).toEqual(1);
    });

    it('has a transaction id of 4 random bytes', () => {
      expect(announceRequest.readUInt32BE(12)).not.toEqual(0);
    });

    it("gets infoHash from torrentParser", () => {
      const torrentSpy = spyOn(torrentParser, "infoHash");
      trackerRequest.buildAnnounceRequest(connectionId, torrent);
      expect(torrentSpy).toHaveBeenCalled();
    })

  });


});
