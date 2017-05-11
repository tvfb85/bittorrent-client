## Tidbit Torrent ##

Tidbit Torrent is a BitTorrent Client built over 10 days in a team of four. It is a command line application that can use .torrent files to download files, and also supports seeding.

### How to use ###

- Clone this repo
- Run `npm install`
- To download an example file run `node index.js test.torrent`
- To download a file of your choice run `node index.js path/to/.torrent`
- To view the tests run `npm test`

### Technologies used ###

- JavaScript (ES6)
- Node.js
- Jasmine-node

### USER STORIES ###

```
As a user,
So I can start using P2P,
I want to connect to other peers.

As a user,
So I can get some cool media quickly,
I want to be able to download files from a peer.

As a user,
So I can share files with others
I want to seed files
```

### Approach ###

- Minimum Viable Product: "A client that downloads a file from a single peer, using the BitTorrent Protocol"
- Version 1: "A client that can connect to multiple peers to download a file"
- Version 2: "A client that supports seeding"

We built the client using a modular structure - seperate components deal with connecting to the tracker, connecting to peers, building messages, parsing messages, parsing the .torrent file, etc. We used classes for those components that would need to hold state, such as the Pieces class, which gets a list of pieces from the .torrent file, and tracks those that have been requested and received. The Queue class queues up pieces in the order to be requested, and the Download class saves the Pieces, Queue, parsed .torrent file, and file to be written to as properties.

This project challenged us to learn about an area that none of us had encountered before, and was a great opportunity to get to grips with networking, different ways of encoding data, and reading/writing files.



