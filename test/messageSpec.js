'use strict';

const message = require('../src/message');
const Buffer = require('buffer').Buffer;

describe('message', () => {

  it('should allocate 68 bytes to the buffer', () => {
    const testBuf = message.buildHandshake();
    expect(testBuf.length).toEqual(68);
  });

  it('should build a hanshake', () => {
    const testBuf = message.buildHandshake();
    expect(testBuf).toEqual(jasmine.any(Buffer));
  });

})
