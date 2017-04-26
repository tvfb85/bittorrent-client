'use strict';

const messageParser = require('../src/messageParser')

describe("MessageParser", () => {

  const buildHandshakeMock = () => {
    const buffer = Buffer.alloc(68);
    // pstrlen
    buffer.writeUInt8(19, 0);
    // pstr
    buffer.write('BitTorrent protocol', 1);
    // reserved
    buffer.writeUInt32BE(0, 20);
    buffer.writeUInt32BE(0, 24);
    // info hash
    buffer.write('this is the infohash', 28);
    // peer id
    buffer.write('this is the peer__id', 48);
    return buffer
  }

  const handshakeMock = buildHandshakeMock();

  it("can identify a handshake message", () => {
    expect(messageParser.isHandshake(handshakeMock)).toBe(true);
  });

})
