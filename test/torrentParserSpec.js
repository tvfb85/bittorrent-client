'use strict';

const torrentParser = require('../src/torrentParser');

describe("torrentParser", () => {

  describe("open", () => {
    it("will take a torrent file and translate it to an object", () => {
      expect(torrentParser.open('./test.torrent').info).toBeDefined();
    });
  });

});
