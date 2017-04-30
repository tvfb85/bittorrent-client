'use strict';

const torrentParser = require('../src/torrentParser');
const crypto = require('crypto');
const bencode = require('bencode');

describe("torrentParser", () => {

  describe("open", () => {
    it("will take a torrent file and translate it to an object", () => {
      expect(torrentParser.open('./test.torrent').info).toBeDefined();
    });
  });

  describe("infohash", () => {

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

  it('writes the info hash to the buffer', () => {
    const info = bencode.encode(torrent.info)
    const hashedInfo = crypto.createHash('sha1').update(info).digest();
    expect(torrentParser.infoHash(torrent).toString('utf8')).toEqual(hashedInfo.toString('utf8'));
  });

  });

});
