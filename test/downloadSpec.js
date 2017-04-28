
'use strict';

const Download = require('../src/download');

describe("Download", () => {

  const torrent = {
    info: {
      length: 1277987,
      name: '<Buffer 66 6c 61 67 2e 6a 70 67>',
      'piece length': 16384,
      pieces: '<Buffer >'
    }
  };
  const download = new Download(torrent, torrent.info.name);

  it("adds all the pieces of the file to a new queue", () => {
    const numberPieces = Math.ceil(torrent.info.length / torrent.info["piece length"]);
    expect(download.queue._queue.length).toEqual(numberPieces);
  });



});
