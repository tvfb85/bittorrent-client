'use strict';

const torrentParser = require('../src/torrentParser');
const message = require('../src/message');


describe('Tracker requests', () => {

  const trackerRequest = require('../src/trackerRequest');

  describe('Connect request', () => {

    let connectionRequest;
    const connectionId = 0x41727101980.toString(16);

    beforeEach(() => {
      connectionRequest = trackerRequest.buildConnectionRequest();
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
          length: 1277987,
          name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
          'piece length': 16384,
          pieces: '<Buffer >'
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
      const torrentSpy = spyOn(torrentParser, "infoHash").andCallThrough();
      trackerRequest.buildAnnounceRequest(connectionId, torrent);
      expect(torrentSpy).toHaveBeenCalled();
    });

    it("gets peerId", () => {
      const messageSpy = spyOn(message, "createPeerId").andCallThrough();
      trackerRequest.buildAnnounceRequest(connectionId, torrent);
      expect(messageSpy).toHaveBeenCalled();
    });

    it("specifies the amount downloaded as 0", () => {
      expect(announceRequest.readUInt32BE(56)).toEqual(0);
      expect(announceRequest.readUInt32BE(60)).toEqual(0);
    });

    it("gets size from torrentParser", () => {
      const torrentSpy = spyOn(torrentParser, "size").andCallThrough();
      trackerRequest.buildAnnounceRequest(connectionId, torrent);
      expect(torrentSpy).toHaveBeenCalled();
    });

    it("specifies the amount uploaded as 0", () => {
      expect(announceRequest.readUInt32BE(72)).toEqual(0);
      expect(announceRequest.readUInt32BE(76)).toEqual(0);
    });

    it("doesn't specify an event", () => {
        expect(announceRequest.readUInt32BE(80)).toEqual(0);
    });

    it("doesn't specify an IP address", () => {
        expect(announceRequest.readUInt32BE(84)).toEqual(0);
    });

    it("saves random bytes as a key", () => {
      expect(announceRequest.readUInt32BE(88)).not.toEqual(0);
    });

    it("saves numwant as the default of -1", () => {
      expect(announceRequest.readInt32BE(92)).toEqual(-1);
    });

    it("saves the port as the default 6881", () => {
      expect(announceRequest.readUInt16BE(96)).toEqual(6881);
    });

  });


});
