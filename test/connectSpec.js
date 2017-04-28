'use strict';
const net = require('net');
const connect = require('../src/connect');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;

describe("Connect", () => {

  let dummySocket;
  let peer;
  let bufferData = Buffer.from("foo");
  let torrent;

  beforeEach(() => {
    dummySocket = new net.Socket();

    peer = {
      port: 'port',
      ip: 'ip'
    }
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
  })

  it('creates a new socket with peer', () => {
    spyOn(net.Socket.prototype, "on");
    connect(peer);
    expect(net.Socket.prototype.on).toHaveBeenCalled();
  });

  it('should connect to the socket', () => {
    spyOn(net.Socket.prototype, "connect");
    connect(peer);
    expect(net.Socket.prototype.connect).toHaveBeenCalledWith(peer.port, peer.ip, jasmine.any(Function));
  });

  it('should write to the socket', () => {
    dummySocket['connect'] = () => {
      return dummySocket.write('hello');
    };

    spyOn(dummySocket, "write");

    connect(peer, dummySocket);
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it('should listen for data', () => {
    dummySocket['on'] = () => {};

    spyOn(dummySocket, "on").andCallThrough();

    connect(peer, dummySocket);
    expect(dummySocket.on).toHaveBeenCalledWith('data', jasmine.any(Function));
  });

  describe("dataHandler helpers", () => {
    // it('calls the callback eventually', () => {
    //   let theCallback = jasmine.createSpy(()=>{});
    //   // let theData = Buffer.from('data');
    //   connect.dataHandler(dummySocket, theCallback);
    //   expect(theCallback).toHaveBeenCalled();
    // });
    //
    // it('puts the data in a Buffer', ()=>{
    //   let theCallback = jasmine.createSpy(()=>{});
    //   spyOn(Buffer, 'concat');
    //   connect.dataHandler(bufferData, theCallback)
    //   expect(Buffer.concat).toHaveBeenCalledWith([jasmine.any(Object(Buffer)), bufferData]);
    // });

    it('gets expected message length for handshake', () => {
      let msg = message.buildHandshake(torrent);
      let handshake = true;
      expect(connect.getExpectedMessageLength(msg, handshake)).toEqual(68)
    });

    it('gets expected message length for an interested message', () => {
      let msg = message.buildInterested(torrent);
      let handshake = false;
      expect(connect.getExpectedMessageLength(msg, handshake)).toEqual(5)
    });

    it('gets expected message length for an request message', () => {
      let payload = {
        index: 1,
        begin: 4,
        length: 128
      };
      let msg = message.buildRequest(payload);
      let handshake = false;
      expect(connect.getExpectedMessageLength(msg, handshake)).toEqual(17)
    });

    it('knows when a received message is complete', () => {
      let completeMsg = message.buildHandshake(torrent);
      let expectedLength = 68;
      expect(connect.isWholeMessage(completeMsg, expectedLength)).toEqual(true)
    });

    it('knows when a received message is incomplete', () => {
      let completeMsg = message.buildHandshake(torrent);
      let incompleteMsg = completeMsg.slice(60, 68);
      let expectedLength = 68;
      expect(connect.isWholeMessage(incompleteMsg, expectedLength)).toEqual(false)
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

    it("checks the queue is not empty", ()=>{
      const lengthSpy = spyOn(queue, 'length');
      connect.requestPiece(dummySocket, pieces, queue)
      expect(lengthSpy).toHaveBeenCalled();
    });

    it("checks a piece is needed", ()=>{
      const neededSpy = spyOn(pieces, 'needed');
      connect.requestPiece(dummySocket, pieces, queue)
      expect(neededSpy).toHaveBeenCalledWith(pieceMock);
    });

    it("removes a piece from the download queue", ()=>{
      const removeFromQueueSpy = spyOn(queue, 'removeFromQueue').andCallThrough();
      connect.requestPiece(dummySocket, pieces, queue)
      expect(removeFromQueueSpy).toHaveBeenCalled();
    });

    it("ask for a piece from the peer if we need the piece", ()=>{
      const pieceSpy = spyOn(pieces, 'addRequested');
      connect.requestPiece(dummySocket, pieces, queue)
      expect(pieceSpy).toHaveBeenCalledWith(pieceMock);
    });

    it("does not ask for a piece from the peer if we do not need the piece", ()=>{
      needed = false;
      const pieceSpy = spyOn(pieces, 'addRequested');
      connect.requestPiece(dummySocket, pieces, queue)
      expect(pieceSpy).not.toHaveBeenCalled();
    });

  });

});
