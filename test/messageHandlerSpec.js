'use strict';

const net = require('net');
const messageHandler = require('../src/messageHandler');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');


describe("messageHandler", () => {

  let dummySocket;
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
    };
    testHandshake = message.buildHandshake(torrent);
    dummySocket = {
      write: function() {}
    };
  });

  it("sends an interested message if it receives a handshake", () => {
    spyOn(dummySocket, "write");
    messageHandler.handle(testHandshake, dummySocket);
    expect(dummySocket.write).toHaveBeenCalled();
  });



});
