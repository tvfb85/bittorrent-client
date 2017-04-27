'use strict';
const net = require('net');
const connect = require('../src/connect');
const messageParser = require('../src/messageParser');
const Buffer = require('buffer').Buffer;

describe("Connect", () => {

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
    dummySocket['on'] = () => {
      return true;
    };

    spyOn(dummySocket, "on");

    connect(peer, dummySocket);
    expect(dummySocket.on).toHaveBeenCalledWith('data', console.log);
  });

  describe("dataHandler", () => {
    // it('calls the callback eventually', () => {
    //   let theCallback = jasmine.createSpy(()=>{});
    //   connect.dataHandler('the data',theCallback);
    //   expect(theCallback).toHaveBeenCalledWith('the data');
    // });

    it('puts the data in a Buffer', ()=>{
      let theCallback = jasmine.createSpy(()=>{});
      spyOn(Buffer, 'concat');
      connect.dataHandler(bufferData, theCallback)
      expect(Buffer.concat).toHaveBeenCalledWith([jasmine.any(Object(Buffer)), bufferData]);
    });

  });

});
