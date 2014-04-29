# LSEQArray

<i>Keywords: distributed systems, collaborative editing, CRDT, LSEQ allocation strategy, unique identifiers</i>

This project aims to provide an implementation of a CRDT-based array using the
allocation strategy LSEQ. Thus, the array structure allows distributed updates
without having to manage the difficult task of solving conflict resolution.

## Installation

```
$ npm install lseqarray
```

## Usage

```javascript
var LSEQArray = require('lseqarray');

// #1 creating the array
// site: our unique site identifier
var lseqArray = new LSEQArray(site);

// #2a inserting an element at the targeted index
// ei: a couple {_e: the element, _i: its unique identifier}
var ei = lseqArray.insert("A",0);

// #2b inserting an element that comes from a remote insert
// rei: a couple {_e: the element, _i: its unique identifier}
var index = lseqArray.applyInsert(rei);

// #3a deleting the element at targeted index
// i: the unique identifier of the element at the index
var i = lseqArray.remove(0);

// #3b deleting the element with its unique identifier "ri"
// ri: the unique identifier of the element to delete
var index = lseqArray.applyRemove(ri);

// #4 accessing the length of the array
var length = lseqArray.length;
```

## Example

[SandEdit](https://github.com/Chat-Wane/SandEdit.git) is a distributed and
decentralized collaborative editor using LSEQArray. It has an optionnal web
front end. Thus, one can simply trigger the events of a Replica to build its
distributed array.

## Others

In this implementations, each cell of the javascript array contains an element
and its unique and immutable identifier. An alternative is the tree-based
structure of the LSEQ-based array accessible at
[Flood-it](https://github.com/jesuspatate/Flood.it.git).

Learn more about CRDTs: [A comprehensive study of Convergent and Commutative Replicated Data Types](http://hal.upmc.fr/docs/00/55/55/88/PDF/techreport.pdf)

Learn more about LSEQ: [LSEQ: an Adaptive Structure for Sequences in Distributed Collaborative Editing](http://hal.archives-ouvertes.fr/docs/00/92/16/33/PDF/fp025-nedelec.pdf)
