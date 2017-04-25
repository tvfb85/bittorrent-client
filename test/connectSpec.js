'use strict';
const net = require('net');
const connect = require('../src/connect');

describe("Connect", () => {

  const peer = {
    port: 'port',
    ip: 'ip'
  }

  it('creates a new socket with peer', () => {
    spyOn(net.Socket.prototype, "on");
    connect(peer);
    expect(net.Socket.prototype.on).toHaveBeenCalled();
  });

});
