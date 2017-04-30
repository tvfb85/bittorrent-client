'use strict';

module.exports.responseType = (resp) => {
  return (resp.readUInt32BE(0) === 0) ? 'connect' : 'announce';
};

module.exports.parseAnnounceResp = (resp) => {
  function groupPeerAddresses(allPeerData, groupSize = 6) {
    let group = [];
    for (let i = 0; i < allPeerData.length / groupSize; i ++) {
      group.push(allPeerData.slice(i*groupSize, i*groupSize + 6));
    }
    return group;
  };

  return {
    peers: groupPeerAddresses(resp.slice(20)).map(peer => { return {ip: peer.slice(0,4).join('.'), port: peer.readUInt16BE(4)}})
  }
};
