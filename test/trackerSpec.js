'use strict';
const dgram = require('dgram');
const tracker = require('../src/tracker');
const trackerParser = require('../src/trackerParser');
const trackerRequest = require('../src/trackerRequest');

describe('Tracker', () => {

  const urlExample = "http://www.example.com:80";


  let torrent = {
    announce: {
      toString: () => { return urlExample }
    }
  }
  const connRespMock = (() => {
    const buffer = Buffer.alloc(16);
    buffer.writeUInt32BE(0, 0); // action
    buffer.writeUInt32BE(1, 4); // transaction ID
    buffer.write('conn', 8); // connection ID
    buffer.write('ecti', 12); // connection ID (2)
    return buffer;
  })();

  const announceRespMock = (() => {
    const buffer = Buffer.alloc(26);
    buffer.writeUInt32BE(1, 0); // action
    buffer.write("tran", 4); // transaction ID
    buffer.write("intr", 8); // interval
    buffer.write("leec", 12); // leechers
    buffer.write("seed", 16); // seeders

    buffer.writeUInt8(192, 20); // IP Address 1
    buffer.writeUInt8(168, 21);
    //buffer.writeUInt8(0, 22);
    buffer.writeUInt8(1, 23);
    buffer.writeUInt16BE(80, 24); // Port

    return buffer;
  })();

  describe('getPeers', () => {

    it('gets the url from the tracker', () => {
      const torrentAnnounce = spyOn(torrent.announce, 'toString').andCallThrough();
      tracker.getPeers(torrent);
      expect(torrentAnnounce).toHaveBeenCalledWith('utf8')
    });

    it('readies the socket', () => {
      const socket = dgram.createSocket('udp4')
      const socketSpy = spyOn(socket, 'on').andCallThrough();
      tracker.getPeers(torrent, socket);
      expect(socketSpy).toHaveBeenCalled();
    });

    it('calls the send message function with connection request', () => {
      const messageSpy = spyOn(tracker, "sendUdpMessage");
      tracker.getPeers(torrent);
      expect(messageSpy).toHaveBeenCalled();
    });

    it('passes a callback to the socket, which parses a connection response', () => {
      const socket = dgram.createSocket('udp4');
      const realSocketSpy = spyOn(socket, 'on').andCallThrough();
      const trackerParserSpy = spyOn(trackerParser, 'parseConnectionResp').andCallThrough();
      tracker.getPeers(torrent, socket);
      realSocketSpy.baseObj._events.message(connRespMock);
      expect(trackerParserSpy).toHaveBeenCalledWith(connRespMock);
    });

    it('passes a callback to the socket, which parses an announce response', () => {
      const socket = dgram.createSocket('udp4');
      const realSocketSpy = spyOn(socket, 'on').andCallThrough();
      const trackerParserSpy = spyOn(trackerParser, 'parseAnnounceResp').andCallThrough();
      tracker.getPeers(torrent, socket, ()=>{});
      realSocketSpy.baseObj._events.message(announceRespMock);
      expect(trackerParserSpy).toHaveBeenCalledWith(announceRespMock);
    });

    it('given an announce response, will call the callback function of getPeers', () => {
      const socket = dgram.createSocket('udp4');
      const realSocketSpy = spyOn(socket, 'on').andCallThrough();
      const trackerParserSpy = spyOn(trackerParser, 'parseAnnounceResp').andCallThrough();
      const callbackMock = {cb: ()=>{}};
      const callbackSpy = spyOn(callbackMock, 'cb');
      tracker.getPeers(torrent, socket, callbackSpy);
      realSocketSpy.baseObj._events.message(announceRespMock);
      expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(Object));
    });

  });

  describe('sendUdpMessage', () => {
    it('sends a message to the socket', () => {
      const socket = dgram.createSocket('udp4')
      const socketSpy = spyOn(socket, 'send');
      const message = trackerRequest.buildConnectionRequest();
      tracker.sendUdpMessage(socket, message, urlExample);
      expect(socketSpy).toHaveBeenCalled();
    });

  });





})
