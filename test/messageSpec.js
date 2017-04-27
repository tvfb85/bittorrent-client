'use strict';

const message = require('../src/message');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');



describe('message', () => {

  let testBuf;
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
    testBuf = message.buildHandshake(torrent);
  })

  it('should allocate 68 bytes to the buffer', () => {
    expect(testBuf.length).toEqual(68);
  });

  it('should return a buffer', () => {
    expect(testBuf).toEqual(jasmine.any(Buffer));
  });

  it('writes the pstrlen to the buffer', () => {
    expect(testBuf[0]).toEqual(19);
  });

  it('writes the pstr to the buffer', () => {
    const pstrChunk = testBuf.slice(1,20);
    expect(pstrChunk.toString('utf8')).toEqual('BitTorrent protocol');
  });

  it('writes the info hash to the buffer', () => {
    // message['infoHash'] = function(torrent) {
    //   const info = bencode.encode(torrent.info);
    //   return crypto.update(info).digest();
    // };
    const info = bencode.encode(torrent.info)
    const torrentInfo = crypto.createHash('sha1').update(info).digest();
    const infoHashChunk = testBuf.slice(28,48).toString('utf8');
    const decodedInfoHashChunk = bencode.decode(infoHashChunk);
    expect(decodedInfoHashChunk).toEqual(torrentInfo);
  });

  it('writes the peer ID to the buffer', () => {
    const peerIdChunk = testBuf.slice(48,56);
    expect(peerIdChunk.toString('utf8')).toEqual('-NVNF01-');
  })

})
