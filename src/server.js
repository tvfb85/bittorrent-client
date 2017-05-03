'use strict';
const fs = require('fs');
const net = require('net');
const message = require('./message')
const Pieces = require('./Pieces');
const messageParser = require('./messageParser')

module.exports.startServer = (torrent) => {
    const server = net.createServer(function(c) {
    listenForIncomingConnections(c, msg => seedMsgHandler(msg, c, torrent));
  });
  server.listen(6881);
}

function listenForIncomingConnections(c, callback) {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;

  c.on('data', function(data) {
    console.log('A NEW INCOMING CONNECTION FROM PEER 2')
    console.log(data.toString('utf8'))
    const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, data]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
      console.log(savedBuf.slice(0, msgLen()).toString('utf8'))
      callback(savedBuf.slice(0, msgLen()));
      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  })
}

function seedMsgHandler(msg, c, torrent) { // need to be able to parse additional message Ids
  if (isHandshake(msg)) {
    console.log('peer1 heard an incoming handshake from peer2')
    c.write(message.buildHandshake(torrent));
  } else {
    console.log('original msg' + msg)
    const m = messageParser.parse(msg);
    console.log(m);
    console.log('that was the parsed msg above')
    // handles the Interested message -> reply with Unchoke message
    if (m.id === 2) sendHaveMessages(c, torrent, m.payload);
    // next message in should be a requestPiece message -> reply with Piece
    if (m.id === 6) sendPiece(c, torrent, m.payload)
  }
}

function sendHaveMessages(c, torrent, msg) {
  console.log('sending the have messages')
  const pieces = new Pieces(torrent);
  const nPieces = pieces._requested;  //cycle through each piece we have
  nPieces.forEach((piece, index) => c.write(message.buildHave(index)));
  c.write(message.buildUnchoke());
}

function sendPiece(c, torrent, msg) {
  console.log('inside the sendPiece, this should be a msg')
  console.log(msg)
  const openFile = fs.openSync('./flag.jpg', 'r');
    let buf = Buffer.alloc(torrent.info['piece length']);
    let position = (msg.index) * 16384;
    fs.read(openFile, buf, 0, 16384, position, (err, bytesRead, buf) => {
      console.log('inside the callback of readFile')
      console.log(bytesRead)
      console.log(buf)
      const pieceBlock = {
        index: msg.index,
        begin: msg.begin,
        block: buf
      }
      c.write(message.buildPiece(pieceBlock));
  })
  console.log('peer 1 sent the piece!!!!!')
}

function isHandshake(msg) {
  return msg.length === msg.readUInt8(0) + 49 &&
         msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
}
