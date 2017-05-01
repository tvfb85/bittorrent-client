'use strict';
const trackerParser = require('../src/trackerParser');
const crypto = require('crypto');


describe('trackerParser', () => {

  const connRespMock = (() => {
    const buffer = Buffer.alloc(16);
    buffer.writeUInt32BE(0, 0); // action
    buffer.writeUInt32BE(1, 4); // transaction ID
    buffer.write('conn', 8); // connection ID
    buffer.write('ecti', 12); // connection ID (2)
    return buffer;
  })();

  const announceRespMock = (() => {
    const buffer = Buffer.alloc(38);
    buffer.writeUInt32BE(1, 0); // action
    buffer.write("tran", 4); // transaction ID
    buffer.write("intr", 8); // interval
    buffer.write("leec", 12); // leechers
    buffer.write("seed", 16); // seeders

    buffer.writeUInt8(192, 20); // IP Address 1
    buffer.writeUInt8(168, 21);
    //buffer.writeUInt8(0, 22);
    buffer.writeUInt8(1, 23);
    buffer.writeUInt16BE(80, 24); // Port

    buffer.writeUInt8(192, 26); // IP Address 2
    buffer.writeUInt8(168, 27);
    //buffer.writeUInt8(0, 28);
    buffer.writeUInt8(4, 29);
    buffer.writeUInt16BE(6881, 30); // Port


    buffer.writeUInt8(192, 32); // IP Address 3
    buffer.writeUInt8(168, 33);
    //buffer.writeUInt8(0, 34);
    buffer.writeUInt8(2, 35);
    buffer.writeUInt16BE(90, 36); // Port

    return buffer;
  })();

  describe('responseType', () => {

    it('identifies a connect message', () => {
      expect(trackerParser.responseType(connRespMock)).toEqual('connect');
    });

    it('does not respond with "announce" for a connect msg', () => {
      expect(trackerParser.responseType(connRespMock)).not.toEqual('announce');
    });

    it('identifies a announce message', () => {
      expect(trackerParser.responseType(announceRespMock)).toEqual('announce');
    });

    it('does not respond with "connect" for a announce msg', () => {
      expect(trackerParser.responseType(announceRespMock)).not.toEqual('connect');
    });

  });

  describe('parseConnectionResp', () => {

    it('parses a buffer and returns an object', () => {
      expect(trackerParser.parseConnectionResp(connRespMock)).toEqual(
        {
          action: 0,
          transactionID: 1,
          connectionID: jasmine.any(Buffer)
        }
      )
    })

  })

  describe('parseAnnounceResp', () => {

    it('is a function', () => {
      expect(trackerParser.parseAnnounceResp(announceRespMock)).toEqual(
        {
          peers: [{ip: "192.168.0.1", port: 80},{ip: "192.168.0.4", port: 6881},{ip: "192.168.0.2", port: 90}]
        }
      )
    });

  });

});
