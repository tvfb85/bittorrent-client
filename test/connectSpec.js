'use strict';
const net = require('net');
const connect = require('../src/connect');

describe("Connect", () => {

  let dummySocket;
  let peer;

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
    expect(net.Socket.prototype.connect).toHaveBeenCalled();
  });

  it('should write to the socket', () => {
    dummySocket['connect'] = function() {
      return dummySocket.write('hello');
    };

    spyOn(dummySocket, "write");

    connect(peer, dummySocket);
    expect(dummySocket.write).toHaveBeenCalled();
  });

  it('should listen for data', () => {
    dummySocket['on'] = function() {
      return true;
    };

    spyOn(dummySocket, "on");

    connect(peer, dummySocket);
    expect(dummySocket.on).toHaveBeenCalledWith('data', console.log);
  })

});
