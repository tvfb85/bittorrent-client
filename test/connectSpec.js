'use strict';
const connect = require('../src/connect');

describe("Connect", () => {

  const socket = {
    on: () => {}
  }

  const peer = {
    port: 'port',
    ip: 'ip'
  }

  it('creates a new socket with peer', () => {
    spyOn(socket, 'on');
    connect(peer, socket);
    expect(socket.on).toHaveBeenCalled();
  })

});
