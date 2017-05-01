'use strict';

const connection = require('../src/connection');
const download = require('../src/download');
const Pieces = require('../src/Pieces');
const torrentParser = require('../src/torrentParser');
const fs = require('fs');

const torrentFilepath = './test.torrent';

const torrent = torrentParser.open(torrentFilepath);

describe("representing a file as Pieces", () => {
  it("will allow us to give a torrent file to be Pieced", () => {
    expect(()=>{new Pieces(torrent)}).not.toThrow();
  });
});
