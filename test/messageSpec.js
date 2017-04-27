'use strict';

const message = require('../src/message');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');



describe('message', () => {

  describe('buildHandshake', () => {

    let testHandshake;
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
      testHandshake = message.buildHandshake(torrent);
    })

    it('should allocate 68 bytes to the buffer', () => {
      expect(testHandshake.length).toEqual(68);
    });

    it('should return a buffer', () => {
      expect(testHandshake).toEqual(jasmine.any(Buffer));
    });

    it('writes the pstrlen to the buffer', () => {
      expect(testHandshake[0]).toEqual(19);
    });

    it('writes the pstr to the buffer', () => {
      const pstrChunk = testHandshake.slice(1,20);
      expect(pstrChunk.toString('utf8')).toEqual('BitTorrent protocol');
    });

    it('writes the info hash to the buffer', () => {
      const info = bencode.encode(torrent.info)
      const hashedInfo = crypto.createHash('sha1').update(info).digest();
      const infoHashFromHandshake = testHandshake.slice(28,48);
      expect(infoHashFromHandshake.toString('utf8')).toEqual(hashedInfo.toString('utf8'));
    });

    it('writes the peer ID to the buffer', () => {
      const peerIdChunk = testHandshake.slice(48,56);
      expect(peerIdChunk.toString('utf8')).toEqual('-NVNF01-');
    });

  });

  describe('buildInterested', () => {

    const testInterestedMessage = message.buildInterested();

    it('has a length of 5', () => {
      expect(testInterestedMessage.length).toEqual(5);
    });

    it('has an id of 2', () => {
      const slicedBuffer = testInterestedMessage.slice(4, 5);
      expect(slicedBuffer.readUInt8()).toEqual(2);
    });

  });

  describe('buildRequest', () => {

    const payload = {
      index: 1,
      begin: 4,
      length: 128
    };

    const testRequestMessage = message.buildRequest(payload);

    it('has a length of 17', () => {
      expect(testRequestMessage.length).toEqual(17);
    });

    it('has an id of 6', () => {
      expect(testRequestMessage.slice(4, 5).readUInt8()).toEqual(6);
    });

    it('writes piece index to the message', () => {
      const slicedBuffer = testRequestMessage.slice(5, 9);
      expect(slicedBuffer.readUInt32BE()).toEqual(payload.index);
    });

    it('writes byte offset within piece to the message', () => {
      const slicedBuffer = testRequestMessage.slice(9, 13);
      expect(slicedBuffer.readUInt32BE()).toEqual(payload.begin);
    });

    it('writes requested length of block to the message', () => {
      const slicedBuffer = testRequestMessage.slice(13, 17);
      expect(slicedBuffer.readUInt32BE()).toEqual(payload.length);
    });
  });

});
