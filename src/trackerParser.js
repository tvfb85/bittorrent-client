'use strict';

module.exports.responseType = (resp) => {
  return (resp.readUInt32BE(0) === 0) ? 'connect' : 'announce';
}
