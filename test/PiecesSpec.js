'use strict';

describe("Pieces", () => {

  const dummyTorrent = {
    info: {
      pieces: {
        length: 100
      }
    }
  }
  const Pieces = require('../src/Pieces');
  const pieces = new Pieces(dummyTorrent);

  it("is defined", () => {
    expect(pieces).toBeDefined();
  });

  it("creates an array for correct number of pieces", () => {
    expect(pieces._requested.length).toEqual(5)
  });

  it("request array initially set to false for each piece", () => {
    expect(pieces._requested[0]).toEqual(false)
  });


});
