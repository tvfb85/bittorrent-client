'use strict';

const net = require('net');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const server = require('../src/server');

describe("leechHandler", () => {

  let dummySocket;
  let peer;
  let bufferData = Buffer.from("foo");

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

  let torrent = {
    info: {
      length: 1277987,
      name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
      'piece length': 16384,
      pieces: '<Buffer >'
    }
  };

  beforeEach(() => {
    dummySocket = new net.Socket();
    peer = {
      port: 'port',
      ip: 'ip'
    };
  });

  it("sends a handshake message if it receives a handshake", () => {
    spyOn(dummySocket, "write");
    const handshakeMsgSpy = spyOn(message, "buildHandshake").andCallThrough();
    server.leechHandler(handshakeMock, dummySocket, torrent);
    expect(handshakeMsgSpy).toHaveBeenCalled();
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it("calls request handler when we get a request Message", () => {
    const msg = "hello";
    const messageParserSpy = spyOn(messageParser, "isHandshake").andReturn(false);
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 6, payload: {}});
    const requestSpy = spyOn(server, 'requestHandler');
    server.leechHandler(msg, dummySocket, torrent);
    expect(requestSpy).toHaveBeenCalled();
  });

});
