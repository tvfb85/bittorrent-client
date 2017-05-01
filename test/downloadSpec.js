
'use strict';

const Download = require('../src/download');
const Pieces = require('../src/Pieces.js');
const Queue = require('../src/Queue.js');
const tracker = require('../src/tracker.js');
const connection = require('../src/connection.js');
const fs = require('fs');

describe("Download", () => {

  const torrent = {
    info: {
      length: 1277987,
      name: 'downloadSpecDemo',
      'piece length': 16384,
      pieces: '<Buffer >'
    }
  };

  it("takes a torrent and a filepath", () => {
    const fsSpy = spyOn(fs, "openSync");
    const download = new Download(torrent, torrent.info.name);
    expect(download.torrent).toEqual(torrent);
    expect(download.pieces).toEqual(jasmine.any(Pieces));
    expect(download.queue).toEqual(jasmine.any(Queue));
    expect(fsSpy).toHaveBeenCalledWith(torrent.info.name, 'w');
  });

  it("adds all the pieces of the file to a new queue", () => {
    const fsSpy = spyOn(fs, "openSync");
    const download = new Download(torrent, torrent.info.name);
    const numberPieces = Math.ceil(torrent.info.length / torrent.info["piece length"]);
    expect(download.queue._queue.length).toEqual(numberPieces);
  });

  describe("start", () => {

    it("asks tracker to get all peers and connects to them", () => {
      const trackerSpy = spyOn(tracker, "getPeers");
      const fsSpy = spyOn(fs, "openSync");
      const download = new Download(torrent, torrent.info.name);
      download.start();
      expect(trackerSpy).toHaveBeenCalled();
    });

    it("asks tracker to get all peers and connects to them", () => {
      const peers = ["peer"];
      const connectSpy = spyOn(connection, "make");
      const trackerSpy = spyOn(tracker, "getPeers").andCallFake((torrent, callback) => { callback(peers)});
      const fsSpy = spyOn(fs, "openSync");
      const download = new Download(torrent, torrent.info.name);
      download.start();
      expect(connectSpy).toHaveBeenCalled();
    });

  });



});
