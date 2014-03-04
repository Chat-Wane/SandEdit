# SandEdit

<i> Keywords: Distributed, Decentralized, Collaborative, Editing, CRDT, 
    Real-time </i>

SandEdit is a project aiming to provide a distributed collaborative editor
based on Conflict-free Replicated Data Type (CRDT) using Node.js. CRDTs for
sequences allow to insert or delete in the sequence without the burden of
managing conflicts. It makes it ideal for real-time editing. Furthermore,
contrarily to well-known editors such as Google Docs, the network architecture
is decentralized. As a consequence, it avoids the single point of failure and
the limitations imposed by the service.

The browser part of this project is only a prototype. It does not manage
multiple documents, saving document etc... Nevertheless, it should be in the
near future (hopefully).

## Installation

```
$ npm install sandedit
```

## Usage

### Within your browser

```
$ npm install socket.io
```

```
$ cd sandedit
$ node server siteId maxSite
       socketioPort replicaAddress replicaMask
       remoteAddress
$ node server 0 42 1337 127.0.0.1:1338 255.0.0.0 127.0.0.1:1338
```

### As a Node.js module

```javascript
var Replica = require('sandedit');

// #1 creating a new node holding a sequence
var replica = new Replica(siteId, maxSite,
    localAddress, localPort, localMask,
    remoteAddress, remotePort);

// #2 inserting an element
// insert the character 'a' at index 0
replica.emit('insert', 'a', 0);

// #3 removing an element
// remove the character at index 0
replica.emit('remove', 0)

// #4 received a remote insertion
replica.on('INS', function(element, index){ ... });

// #5 received a remote removing
replica.on('DEL', function(index){ ... });
```

## Dependencies

SandEdit uses the following packages:
*    [causaltrack](https://github.com/Chat-Wane/CausalTrack):
     the structure for handling causality
*    [lseqarray](https://github.com/Chat-Wane/LSEQArray):
     the distributed data structure of the array
*    [smokesignal](https://github.com/marcelklehr/smokesignal):
     the management of the p2p decentralized network
*    [socket.io](https://github.com/LearnBoost/socket.io):
     the browser display

Within the web page served by socket.io:
*    [ace](https://github.com/ajaxorg/ace): the code editor embedded in the
     web page
*    [bootstrap](https://github.com/twbs/bootstrap): the style of the web page
