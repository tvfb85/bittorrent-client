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

  it("creates an array for correct number of pieces we will request", () => {
    expect(pieces._requested.length).toEqual(5);
  });

  it("request array initially set to false for each piece we will request", () => {
    expect(pieces._requested[0]).toEqual(false);
  });

  it("creates an array for correct number of pieces we want to receive", () => {
    expect(pieces._received.length).toEqual(5);
  });

  it("request array initially set to false for each piece we want to receive", () => {
    expect(pieces._received[0]).toEqual(false);
  });

  it("knows when it doesn't have all the pieces", () => {
    expect(pieces.isComplete()).toBe(false);
  });

  it("knows when it has all the pieces", () => {
    pieces._received = ["piece 1", "piece 2", "piece 3", "piece 4"];
    expect(pieces.isComplete()).toBe(true);
  });

  it("resets the requested array when we've requested all the pieces but continue to receive data", () => {
    pieces._requested = ["all the pieces"];
    pieces._received = ["only some pieces"];
    pieces.needed("pieceExample");
    expect(pieces._requested).toEqual(["only some pieces"]);
  });

  it("doesn't reset the requested array when receiving data as normal", () => {
    pieces._requested = [false];
    pieces._received = ["only some pieces"];
    pieces.needed("pieceExample");
    expect(pieces._requested).not.toEqual(["only some pieces"]);
  });

  it("knows when it needs a specific piece", () => {
    pieces._received = [false];
    const pieceExample = {index:0};
    expect(pieces.needed(pieceExample)).toBe(true);
  });

  it("knows when it does not need a specific piece", () => {
    pieces._received = [false, false, "i have piece 3"]
    const pieceExample = {index:3};
    expect(pieces.needed(pieceExample)).toBe(true);
  });

  it("can accept a requested piece object", () => {
    pieces._requested = [];
    const pieceExample = {index:3};
    pieces.addRequested(pieceExample)
    expect(pieces._requested).toEqual([,,,pieceExample]);
  });

  it("can accept a received piece object", () => {
    pieces._received = [];
    const pieceExample = {index:3};
    pieces.addReceived(pieceExample)
    expect(pieces._received).toEqual([,,,pieceExample]);
  });

});
