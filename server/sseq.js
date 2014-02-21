var Duplex = require('stream').Duplex;
var EventEmitter = require('events').EventEmitter;
var LSEQArray = require('lseqarray');
var IVV = require('causaltrack').IVV;
var util = require('util');
util.inherits(SSeq, Duplex);

var MAX_SITE = 100;

function SSeq(site, options){
    Duplex.call(this, options);
    this._vector = new IVV(site,MAX_SITE);
    this._buffer = [];
    this._array = new LSEQArray(site);
    this._emitter = new EventEmitter();
};

// receiving data // input
SSeq.prototype._read = function(n) {
};

// emiting data // output
SSeq.prototype._write = function(chunk, encoding, callback) {
    var tei = JSON.parse(chunk);
    if (tei._type == 'INS'){
	if (!this._vector.isLower(tei._causal)){
	    this._vector.incrementFrom(tei._causal);
	    var index = this._array.applyInsert(tei._data._e, tei._data._i);
	    this._emitter.emit('insert', tei._data._e, index);
	    // from sseq -> node

	    for (var i=0; i<this._buffer.length; ++i){
		var msg = this._buffer[i];
		if (this._vector.isRdy(msg._causal)){
		    var index = this._array.applyRemove(tei._data);
		    this._emitter.emit('remove', index);
		    // from sseq -> node
		    this._array.splice(i, 1);
		    --i;
		};
	    };
	};
    };
    if (tei._type == 'REM'){
	if (this._vector.isRdy(tei._causal)){
	    var index = this._array.applyRemove(tei._data);
	    this._emitter.emit('remove', index); // from sseq -> node
	}else{
	    this._buffer.push(tei);
	};
    };
    callback();
};

module.exports = SSeq;
