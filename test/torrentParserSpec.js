'use strict';

const torrentParser = require('../src/torrentParser');
const crypto = require('crypto');
const bencode = require('bencode');

describe("torrentParser", () => {

  const torrent = {
    info: {
      length: 1277987,
      name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
      'piece length': 16384,
      pieces: '<Buffer >'
    }
  }

  describe("open", () => {
    it("will take a torrent file and translate it to an object", () => {
      expect(torrentParser.open('./test.torrent').info).toBeDefined();
    });
  });

  describe("infohash", () => {

  it('writes the info hash to the buffer', () => {
    const info = bencode.encode(torrent.info)
    const hashedInfo = crypto.createHash('sha1').update(info).digest();
    expect(torrentParser.infoHash(torrent).toString('utf8')).toEqual(hashedInfo.toString('utf8'));
  });

  });

  describe("size", () => {
     it("calculates the size of the file and returns it as a buffer", () => {
       const size1 = torrentParser.size(torrent).readUInt32BE(0).toString();
       const size2 = torrentParser.size(torrent).readUInt32BE(4).toString();
       const totalSize = size1 + size2;
       expect(totalSize).toEqual('01277987');
     });

  });


});
