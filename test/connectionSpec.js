'use strict';

const net = require('net');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');
const connection = require('../src/connection');
const fs = require('fs');

let dummySocket = {
  write: ()=>{},
  end: ()=>{},
  on: ()=>{}
};
let torrent = {
  info: {
    length: 1277987,
    name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
    'piece length': 16384,
    pieces: '<Buffer >'
  }
};
let testHandshake = message.buildHandshake(torrent);
let dummyPieces = "dummyPieces";
let dummyQueue = {length: ()=>{}};
let dummyPieceResp = {
  index: 1,
  begin: 0,
  block:  {
    length: 10
  }
};
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


describe("connector functions", () => {

  let dummySocket;
  let peer;
  let bufferData = Buffer.from("foo");

  beforeEach(() => {
    dummySocket = new net.Socket();
    peer = {
      port: 'port',
      ip: 'ip'
    }
  })

  it('creates a new socket with peer', () => {
    spyOn(net.Socket.prototype, "on");
    connection.make(peer);
    expect(net.Socket.prototype.on).toHaveBeenCalled();
  });

  it('should connect to the socket', () => {
    spyOn(net.Socket.prototype, "connect");
    connection.make(peer);
    expect(net.Socket.prototype.connect).toHaveBeenCalledWith(peer.port, peer.ip, jasmine.any(Function));
  });

  it('should write to the socket', () => {
    dummySocket['connect'] = () => {
      return dummySocket.write('hello');
    };
    spyOn(dummySocket, "write");
    connection.make(peer, torrent, dummyPieces, dummyQueue, 'filepath', dummySocket);
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it('should listen for data', () => {
    const socketOnSpy = spyOn(dummySocket, 'on').andCallThrough();
    connection.make(peer, torrent, dummyPieces, dummyQueue, 'filepath', dummySocket);
    expect(socketOnSpy).toHaveBeenCalledWith('data', jasmine.any(Function));
  });

  it("on receiving a handshake message, it will call the dataHandler callback", () => {
    const socketSpy = spyOn(dummySocket, 'on').andCallThrough();
    const callbackMock = {cb: ()=>{}};
    const callbackSpy = spyOn(callbackMock, 'cb');
    connection.connectors.dataHandler(dummySocket, callbackSpy);
    socketSpy.baseObj._events.data(handshakeMock);
    expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(Buffer));
  });

  describe("dataHandler helpers", () => {

    it('gets expected message length for handshake', () => {
      let msg = message.buildHandshake(torrent);
      let handshake = true;
      expect(connection.connectors.getExpectedMessageLength(msg, handshake)).toEqual(68)
    });

    it('gets expected message length for an interested message', () => {
      let msg = message.buildInterested(torrent);
      let handshake = false;
      expect(connection.connectors.getExpectedMessageLength(msg, handshake)).toEqual(5)
    });

    it('gets expected message length for an request message', () => {
      let payload = {
        index: 1,
        begin: 4,
        length: 128
      };
      let msg = message.buildRequest(payload);
      let handshake = false;
      expect(connection.connectors.getExpectedMessageLength(msg, handshake)).toEqual(17)
    });

    it('knows when a received message is complete', () => {
      let completeMsg = message.buildHandshake(torrent);
      let expectedLength = () => { return 68; };
      expect(connection.connectors.isWholeMessage(completeMsg, expectedLength)).toEqual(true)
    });

    it('knows when a received message is incomplete', () => {
      let completeMsg = message.buildHandshake(torrent);
      let incompleteMsg = completeMsg.slice(60, 68);
      let expectedLength = () => { return 68; };
      expect(connection.connectors.isWholeMessage(incompleteMsg, expectedLength)).toEqual(false)
    });

  });

  describe("requestPiece", () => {
    let fakeLength;
    let needed = true;
    let pieces = {
                   addRequested: () => {},
                   needed: () => needed
                 };
    let pieceMock = jasmine.createSpy("pieceMock");
    let queue = {
                  removeFromQueue: ()=>{--fakeLength;return pieceMock},
                  length: ()=>{ return fakeLength; }
                };
    beforeEach(()=>{
      fakeLength = 1;
    });
    let dummySocket = {
      write: ()=>{},
      end: ()=>{}
    };

    it("checks the queue is not empty", ()=>{
      const lengthSpy = spyOn(queue, 'length');
      connection.connectors.requestPiece(dummySocket, pieces, queue)
      expect(lengthSpy).toHaveBeenCalled();
    });

    it("checks a piece is needed", ()=>{
      const neededSpy = spyOn(pieces, 'needed');
      connection.connectors.requestPiece(dummySocket, pieces, queue)
      expect(neededSpy).toHaveBeenCalledWith(pieceMock);
    });

    it("removes a piece from the download queue", ()=>{
      dummySocket['write'] = () => {};
      const removeFromQueueSpy = spyOn(queue, 'removeFromQueue').andCallThrough();
      connection.connectors.requestPiece(dummySocket, pieces, queue)
      expect(removeFromQueueSpy).toHaveBeenCalled();
    });

    it("ask for a piece from the peer if we need the piece", ()=>{
      dummySocket['write'] = () => {};
      const pieceSpy = spyOn(pieces, 'addRequested');
      const socketSpy = spyOn(dummySocket, 'write');
      const requestSpy = spyOn(message, 'buildRequest');
      connection.connectors.requestPiece(dummySocket, pieces, queue)
      expect(pieceSpy).toHaveBeenCalledWith(pieceMock);
      expect(requestSpy).toHaveBeenCalled();
      expect(socketSpy).toHaveBeenCalled();
    });

    it("does not ask for a piece from the peer if we do not need the piece", ()=>{
      needed = false;
      const pieceSpy = spyOn(pieces, 'addRequested');
      const socketSpy = spyOn(dummySocket, 'write');
      connection.connectors.requestPiece(dummySocket, pieces, queue)
      expect(pieceSpy).not.toHaveBeenCalled();
      expect(socketSpy).not.toHaveBeenCalled();
    });

  });

});

describe("handler functions", () => {

  it("sends an interested message if it receives a handshake", () => {
    spyOn(dummySocket, "write");
    const interestedMessage = spyOn(message, "buildInterested").andCallThrough();
    connection.handlers.handle(testHandshake, dummySocket);
    expect(interestedMessage).toHaveBeenCalled();
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it("parses any non-handshake message", () => {
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 678});
    connection.handlers.handle(msg, dummySocket);
    expect(parseSpy).toHaveBeenCalledWith(msg);
  });

  it("calls unchokeHandler when we get a unchoke Message", ()=>{
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 1});
    const unchokeSpy = spyOn(connection.handlers, 'unchokeHandler');
    connection.handlers.handle(msg, dummySocket, 'filePath', dummyPieces, dummyQueue);
    expect(unchokeSpy).toHaveBeenCalledWith(dummySocket, dummyPieces, dummyQueue);
  });

  it("calls pieceHandler when we get a piece Message", ()=>{
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 7, payload: msg});
    spyOn(connection.handlers, 'pieceHandler');
    connection.handlers.handle(msg, dummySocket, 'filePath', dummyPieces, dummyQueue, torrent);
    expect(connection.handlers.pieceHandler).toHaveBeenCalledWith('filePath', msg, torrent, dummySocket, dummyPieces, dummyQueue);
  });

  it('calls requestPiece when called', () => {
    const connectSpy = spyOn(connection.connectors, "requestPiece");
    connection.handlers.unchokeHandler(dummySocket, dummyPieces, dummyQueue);
    expect(connectSpy).toHaveBeenCalledWith(dummySocket, dummyPieces, dummyQueue);
  });

});


describe("pieceHandler", () => {

  let pieces;

  beforeEach(()=>{
    pieces = {isComplete: ()=>{}};
  });

  it('writes a block from a payload to the file', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(false);
    const fileSpy = spyOn(fs, "write");
    connection.handlers.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(fileSpy).toHaveBeenCalledWith('filePath', dummyPieceResp.block, 0, dummyPieceResp.block.length, 16384, jasmine.any(Function));
  });

  it('requests the next piece in the queue', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(false);
    const fileSpy = spyOn(fs, "write");
    const connectSpy = spyOn(connection.connectors, 'requestPiece');
    connection.handlers.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(connectSpy).toHaveBeenCalledWith(dummySocket, pieces, dummyQueue);
  });

  it('does not request another piece if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const connectSpy = spyOn(connection.connectors, "requestPiece");
    connection.handlers.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('ends socket connection if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const socketSpy = spyOn(dummySocket, "end");
    connection.handlers.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(socketSpy).toHaveBeenCalled();
  });

  it('closes file sync if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const fileCloseSpy = spyOn(fs, "closeSync");
    const socketSpy = spyOn(dummySocket, "end");
    connection.handlers.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(fileCloseSpy).toHaveBeenCalledWith('filePath');
  });

});
