'use strict';

describe('Tracker requests', () => {

  const trackerRequest = require('../src/trackerRequest');

  describe('Connect request', () => {

    let connectionRequest;
    const connectionId = 0x41727101980.toString(16);

    beforeEach(() => {
      connectionRequest = trackerRequest.buildConnectionRequest();
      console.log(connectionRequest.slice(0, 4).toString('utf8'));
    });

    it('has a length of 16', () => {
      expect(connectionRequest.length).toEqual(16);
    });

    it('has the correct connection id', () => {
      const id = connectionRequest.readUInt32BE(0).toString(16) + connectionRequest.readUInt32BE(4).toString(16);
      expect(id).toEqual(connectionId);
    });

    it('has an action of 0', () => {
      expect(connectionRequest.readUInt32BE(8)).toEqual(0);
    });

    it('has a transaction id of 4 random bytes', () => {
      expect(connectionRequest.readUInt32BE(12)).not.toEqual(0);
    });
  });

});
