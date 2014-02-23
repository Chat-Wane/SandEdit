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

## Usage

### Within your browser

### As a Node.js module

Ongoing work, the specifications are not met yet.

```javascript
var Node = require('sandedit').Node;

// #1 creating a new node
// 0 is the unique identifier of the site
// 1337 is the port of our local node
// 1400 is the port of a connected node
var node = new Node(0, 1337, 1400);

// #2 inserting an element
// insert the character 'a' at index 0
node.emit('insert', 'a', 0);

// #3 removing an element
// remove the character at index 0
node.emit('remove', 0)

// #4 received a remote insertion
node.on('INS', function(element, index){ ... });

// #5 received a remote removing
node.on('DEL', function(index){ ... });
```

## Dependencies

SandEdit uses the following packages:
<ul>
<li> [causaltrack](https://github.com/Chat-Wane/CausalTrack):
     the structure for handling causality </li>
<li> [lseqarray](https://github.com/Chat-Wane/LSEQArray):
     the distributed data structure of the array </li>
<li> [smokesignal](https://github.com/marcelklehr/smokesignal):
     the management of the p2p decentralized network </li>
<li> [socket.io](https://github.com/LearnBoost/socket.io):
     the browser display </li>
</ul>