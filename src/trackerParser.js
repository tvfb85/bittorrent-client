'use strict';

module.exports.responseType = (resp) => {
  return (resp.readUInt32BE(0) === 0) ? 'connect' : 'announce';
};

module.exports.parseConnectionResp = (resp) => {
  return {
    action: resp.readUInt32BE(0),
    transactionID: resp.slice(4, 8).toString('utf8'),
    connectionID: resp.slice(8, 12).toString('utf8') + resp.slice(12, 16).toString('utf8')
  }
}

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
