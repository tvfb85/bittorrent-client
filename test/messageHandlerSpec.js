'use strict';

const net = require('net');
const messageHandler = require('../src/messageHandler');
const message = require('../src/message');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const crypto = require('crypto');
const connect = require('../src/connect');
const fs = require('fs');

let dummySocket = {
  write: ()=>{},
  end: ()=>{}
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
let interestedMessage;
let dummyPieces = "dummyPieces";
let dummyQueue = "dummyQueue";
let dummyPieceResp = {
  index: 1,
  begin: 0,
  block:  {
    length: 10
  }
};

describe("messageHandler", () => {

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
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 1});
    const unchokeSpy = spyOn(messageHandler, 'unchokeHandler');
    messageHandler.handle(msg, dummySocket, 'filePath', dummyPieces, dummyQueue);
    expect(unchokeSpy).toHaveBeenCalledWith(dummySocket, dummyPieces, dummyQueue);
  });

  it("calls pieceHandler when we get a piece Message", ()=>{
    const msg = "hello";
    const parseSpy = spyOn(messageParser, "parse").andReturn({id: 7, payload: msg});
    const pieceSpy = spyOn(messageHandler, 'pieceHandler');
    messageHandler.handle(msg, dummySocket, 'filePath', dummyPieces, dummyQueue, torrent);
    expect(pieceSpy).toHaveBeenCalledWith('filePath', msg, torrent);
  });

  it('calls requestPiece when called', () => {
    const connectSpy = spyOn(connect, "requestPiece");
    messageHandler.unchokeHandler(dummySocket, dummyPieces, dummyQueue);
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
    const connectSpy = spyOn(connect, "requestPiece");
    messageHandler.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(fileSpy).toHaveBeenCalledWith('filePath', dummyPieceResp.block, 0, dummyPieceResp.block.length, 16384, jasmine.any(Function));
  });

  it('requests the next piece in the queue', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(false);
    const fileSpy = spyOn(fs, "write");
    const connectSpy = spyOn(connect, "requestPiece");
    messageHandler.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(connectSpy).toHaveBeenCalledWith(dummySocket, pieces, dummyQueue);
  });

  it('does not request another piece if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const connectSpy = spyOn(connect, "requestPiece");
    messageHandler.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('ends socket connection if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const socketSpy = spyOn(dummySocket, "end");
    messageHandler.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(socketSpy).toHaveBeenCalled();
  });

  it('closes file sync if file is complete', () => {
    const piecesCompleteSpy = spyOn(pieces, 'isComplete').andReturn(true);
    const fileSpy = spyOn(fs, "write");
    const fileCloseSpy = spyOn(fs, "closeSync");
    const socketSpy = spyOn(dummySocket, "end");
    messageHandler.pieceHandler('filePath', dummyPieceResp, torrent, dummySocket, pieces, dummyQueue);
    expect(fileCloseSpy).toHaveBeenCalledWith('filePath');
  });

});
