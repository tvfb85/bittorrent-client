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
      const callbackMock = {cb: ()=>{}};
      tracker.getPeers(torrent, callbackMock, socket);
      expect(socketSpy).toHaveBeenCalled();
    });

    describe('connection messaging', () => {

      it('calls the send message function with connection request', () => {
        const messageSpy = spyOn(tracker, "sendUdpMessage");
        tracker.getPeers(torrent);
        expect(messageSpy).toHaveBeenCalled();
      });

      it('passes a callback to the socket, which parses a connection response', () => {
        const socket = dgram.createSocket('udp4');
        const messageSpy = spyOn(tracker, "sendUdpMessage");
        const realSocketSpy = spyOn(socket, 'on').andCallThrough();
        const announceReqSpy = spyOn(trackerRequest, 'buildAnnounceRequest');
        const trackerParserSpy = spyOn(trackerParser, 'parseConnectionResp').andCallThrough();
        const callbackMock = {cb: ()=>{}};
        tracker.getPeers(torrent, callbackMock, socket);
        realSocketSpy.baseObj._events.message(connRespMock);
        expect(trackerParserSpy).toHaveBeenCalledWith(connRespMock);
      });

      it('given a connection response, will build an announce request message', () => {
        const socket = dgram.createSocket('udp4');
        const messageSpy = spyOn(tracker, "sendUdpMessage");
        const realSocketSpy = spyOn(socket, 'on').andCallThrough();
        const trackerParserSpy = spyOn(trackerParser, 'parseConnectionResp').andCallThrough();
        const callbackMock = {cb: ()=>{}};
        const callbackSpy = spyOn(callbackMock, 'cb');
        const announceReqSpy = spyOn(trackerRequest, 'buildAnnounceRequest');
        tracker.getPeers(torrent, callbackSpy, socket);
        realSocketSpy.baseObj._events.message(connRespMock);
        expect(announceReqSpy).toHaveBeenCalledWith(jasmine.any(Buffer), torrent);
      });

      it('calls the send message function with the announce request', () => {
        const socket = dgram.createSocket('udp4');
        const realSocketSpy = spyOn(socket, 'on').andCallThrough();
        const trackerParserSpy = spyOn(trackerParser, 'parseConnectionResp').andCallThrough();
        const callbackMock = {cb: ()=>{}};
        const callbackSpy = spyOn(callbackMock, 'cb');
        const announceReqSpy = spyOn(trackerRequest, 'buildAnnounceRequest');
        tracker.getPeers(torrent, callbackSpy, socket);
        const messageSpy = spyOn(tracker, "sendUdpMessage");
        realSocketSpy.baseObj._events.message(connRespMock);
        expect(messageSpy).toHaveBeenCalled();
      });

    });

    describe('announce messaging', () => {

      it('passes a callback to the socket, which parses an announce response', () => {
        const socket = dgram.createSocket('udp4');
        const realSocketSpy = spyOn(socket, 'on').andCallThrough();
        const trackerParserSpy = spyOn(trackerParser, 'parseAnnounceResp').andCallThrough();
        tracker.getPeers(torrent, ()=>{}, socket);
        realSocketSpy.baseObj._events.message(announceRespMock);
        expect(trackerParserSpy).toHaveBeenCalledWith(announceRespMock);
      });

      it('given an announce response, will call the callback function of getPeers', () => {
        const socket = dgram.createSocket('udp4');
        const realSocketSpy = spyOn(socket, 'on').andCallThrough();
        const trackerParserSpy = spyOn(trackerParser, 'parseAnnounceResp').andCallThrough();
        const callbackMock = {cb: ()=>{}};
        const callbackSpy = spyOn(callbackMock, 'cb');
        tracker.getPeers(torrent, callbackSpy, socket);
        realSocketSpy.baseObj._events.message(announceRespMock);
        expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(Object));
      });

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

});
