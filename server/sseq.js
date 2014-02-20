var Duplex = require('stream').Duplex;
var LSEQArray = require('lseqarray');
var util = require('util');
util.inherits(SSeq, Duplex);

function SSeq(site, options){
    Duplex.call(this, options);
    this._array = new LSEQArray(site);
};

// receiving data // input
SSeq.prototype._read = function(n) {
//    console.log('in_read:' + n );
};

// emiting data // output
SSeq.prototype._write = function(chunk, encoding, callback) {
//    console.log("in_write: " + chunk);
    var tei = JSON.parse(chunk);
    if (tei._type == 'INS'){
	this._array.applyInsert(tei._data._e, tei._data._i);
    };
    if (tei._type == 'DEL'){
	this._array.applyInsert(tei._data);
    };
    callback();
};

module.exports = SSeq;
