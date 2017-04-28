'use strict';

const torrentParser = require('./src/torrentParser');
const Download = require ('./src/download')
const torrent = torrentParser.open(process.argv[2]);


const download = new Download(torrent);
download.start();
