'use strict';

const message = require('../src/message');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');



describe('message', () => {

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
    expect(infoHashFromHandshake.toString()).toEqual(hashedInfo.toString());
  });

  it('writes the peer ID to the buffer', () => {
    const peerIdChunk = testHandshake.slice(48,56);
    expect(peerIdChunk.toString('utf8')).toEqual('-NVNF01-');
  });

})
