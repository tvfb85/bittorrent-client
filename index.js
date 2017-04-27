'use strict';

const torrentParser = require('./src/torrentParser');
const download = require ('./src/download')
const torrent = torrentParser.open(process.argv[2]);

download(torrent);
