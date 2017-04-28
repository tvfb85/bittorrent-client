'use strict';

const net = require('net');
const messageHandler = require('../src/messageHandler');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');
const connect = require('../src/connect')


describe("messageHandler", () => {

  let dummySocket;
  let testHandshake;
  let torrent;
  let interestedMessage;
  let dummyQueue;
  let dummyPieces;

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
    dummyPieces = "dummyPieces";
    dummyQueue = "dummyQueue";
  });

  it("sends an interested message if it receives a handshake", () => {
    spyOn(dummySocket, "write");
    const interestedMessage = spyOn(message, "buildInterested").andCallThrough();
    messageHandler.handle(testHandshake, dummySocket);
    expect(interestedMessage).toHaveBeenCalled();
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it("parses any non-handshake message", () => {
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 678});
    messageHandler.handle(msg, dummySocket);
    expect(parseSpy).toHaveBeenCalledWith(msg);
  });

  it("calls unchokeHandler when we get a unchoke Message", ()=>{
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 2});
    const unchokeSpy = spyOn(messageHandler, 'unchokeHandler');
    messageHandler.handle(msg, dummySocket, dummyPieces, dummyQueue);
    expect(unchokeSpy).toHaveBeenCalledWith(dummySocket, dummyPieces, dummyQueue);
  });

  it("calls pieceHandler when we get a piece Message", ()=>{
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 7, payload: msg});
    const pieceSpy = spyOn(messageHandler, 'pieceHandler');
    messageHandler.handle(msg, dummySocket);
    expect(pieceSpy).toHaveBeenCalledWith(dummySocket, msg);
  });

  it('calls requestPiece when called', () => {
    const connectSpy = spyOn(connect, "requestPiece");
    messageHandler.unchokeHandler(dummySocket, dummyPieces, dummyQueue);
    expect(connectSpy).toHaveBeenCalledWith(dummySocket, dummyPieces, dummyQueue);
  })

});
