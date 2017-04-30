'use strict';
const trackerParser = require('../src/trackerParser');
const crypto = require('crypto');


describe('', () => {

  const connRespMock = (() => {
    const buffer = Buffer.alloc(16);
    buffer.writeUInt32BE(0, 0); // action
    buffer.writeUInt32BE(0, 4); // transaction ID
    buffer.writeUInt32BE(0, 8); // connection ID
    buffer.writeUInt32BE(0, 12); // connection ID (2)
    return buffer;
  })();

  const announceRespMock = (() => {
    const buffer = Buffer.alloc(16);
    buffer.writeUInt32BE(1, 0); // action
    buffer.writeUInt32BE(0, 4); // transaction ID
    buffer.writeUInt32BE(0, 8); // connection ID
    buffer.writeUInt32BE(0, 12); // connection ID (2)
    return buffer;
  })();

  it('identifies a connect message', () => {
    expect(trackerParser.responseType(connRespMock)).toEqual('connect');
  })

  it('does not respond with "announce" for a connect msg', () => {
    expect(trackerParser.responseType(connRespMock)).not.toEqual('announce');
  })

  it('identifies a announce message', () => {
    expect(trackerParser.responseType(announceRespMock)).toEqual('announce');
  })

  it('does not respond with "connect" for a announce msg', () => {
    expect(trackerParser.responseType(announceRespMock)).not.toEqual('connect');
  })

});
