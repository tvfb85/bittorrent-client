'use strict';

const peer = require('../src/peer');

describe('peer', () => {

  it('has a port', () => {
    expect(peer.port).toBeDefined();
  });

  it('has an ip address', () => {
    expect(peer.ip).toBeDefined();
  });
});
