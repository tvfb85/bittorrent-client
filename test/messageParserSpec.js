'use strict';

const messageParser = require('../src/messageParser')

const handshakeMock = (() => {
  const buffer = Buffer.alloc(68);
  buffer.writeUInt8(19, 0); // pstrlen
  buffer.write('BitTorrent protocol', 1); // pstr
  buffer.writeUInt32BE(0, 20); // reserved pt1
  buffer.writeUInt32BE(0, 24); // reserved pt2
  buffer.write('this is the infohash', 28); // infohash
  buffer.write('this is the peer__id', 48); // peerid
  return buffer
})();

const pieceId = 7;
const payload = "foo";
const pieceMsgSize = 9 + payload.length;

const pieceMock = (() => {
  const buffer = Buffer.alloc(payload.length + 13);
  buffer.writeUInt32BE(pieceMsgSize, 0); //len
  buffer.writeUInt8(pieceId, 4); // id
  buffer.writeUInt32BE(1, 5); // index
  buffer.writeUInt32BE(0, 9); // begin
  buffer.write(payload,13) // payload
  return buffer;
})();

const unchokeId = 1;

const unchokeMock = (() => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0); //len
  buffer.writeUInt8(unchokeId, 4); // id
  return buffer;
})();

describe("MessageParser", () => {

  it("can identify a handshake message", () => {
    expect(messageParser.isHandshake(handshakeMock)).toBe(true);
  });

  it("can identify a piece message", () => {
    expect(messageParser.parse(pieceMock).id).toEqual(pieceId);
  });

  it("can tell us how big a message is", () => {
    expect(messageParser.parse(pieceMock).size).toEqual(pieceMsgSize);
  });

  it("can allow us to access a message's payload", () => {
    let payloadToCompare = messageParser.parse(pieceMock).payload.block.toString();
    expect(payloadToCompare).toEqual(payload);
  });

  it("can identify an unchoke message", () => {
    expect(messageParser.parse(unchokeMock).id).toEqual(unchokeId);
  });

  it("sets payload to null for unchoke message", () => {
    expect(messageParser.parse(unchokeMock).payload).toEqual(null);
  });

})
