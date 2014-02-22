var Duplex = require('stream').Duplex;
var EventEmitter = require('events').EventEmitter;
var LSEQArray = require('lseqarray');
var IVV = require('causaltrack').IVV;
var util = require('util');
util.inherits(SSeq, Duplex);

var MAX_SITE = 100;

/*!
 * \class SSeq
 * \brief Input Output of the dissemination protocol
 * \param site the unique site identifier
 * \param option the additionnal argument for the duplex class
 */
function SSeq(site, options){
    Duplex.call(this, options);
    this._vector = new IVV(site,MAX_SITE);
    this._buffer = [];
    this._array = new LSEQArray(site);
    this._emitter = new EventEmitter();
};

/*!
 * \brief Input
 */ 
SSeq.prototype._read = function(n) {
};

/*!
 * \Brief Output
 * \param chunk the data received from the network
 * \param encoding the encoding of the chunk
 * \param callback the callback function that ends the function
 */
SSeq.prototype._write = function(chunk, encoding, callback) {
    var tei = JSON.parse(chunk);
    if (tei._type == 'INS'){ // #1 insert operation
	if (!this._vector.isLower(tei._causal)){ // #1a handle double reception
	    this._vector.incrementFrom(tei._causal); // #1b causality
	    var index = this._array.applyInsert(tei._data._e, tei._data._i);
	    this._emitter.emit('insert', tei._data._e, index);
	    // #1c Notify the change (from sseq -> node)

	    // #1d Check if some deletes are ready now
	    for (var i=0; i<this._buffer.length; ++i){
		var msg = this._buffer[i];
		if (this._vector.isRdy(msg._causal)){
		    var index = this._array.applyRemove(tei._data);
		    this._emitter.emit('remove', index);
		    // 1e Notify the change (from sseq -> node)
		    this._array.splice(i, 1);
		    --i;
		};
	    };
	};
    };
    if (tei._type == 'REM'){ // #2 delete operation
	if (this._vector.isRdy(tei._causal)){ // #2a look for its target
	    var index = this._array.applyRemove(tei._data);
	    this._emitter.emit('remove', index);
	    // #2b notify the change (from sseq -> node)
	}else{
	    this._buffer.push(tei); // # 2c delay the operation
	};
    };
    callback();
};

module.exports = SSeq;
