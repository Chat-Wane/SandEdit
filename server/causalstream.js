var Duplex = require('stream').Duplex;
var IVV = require('causaltrack').IVV;
var util = require('util');
util.inherits(CausalStream, Duplex);

/*!
 * \class CausalStream
 * \brief Input Output of the dissemination protocol
 * \param option the additionnal argument for the duplex class
 */
function CausalStream(parent, site, maxSite, options){
    Duplex.call(this, options);
    this._parent = parent;
    this._ivv = new IVV(site, maxSite);
    this._buffer = [];
};

CausalStream.prototype._read = function(n){
    // Nothing
};

/*!
 * \brief Output
 * \param chunk the data received from the network
 * \param encoding the encoding of the chunk
 * \param callback the callback function that ends the function
 */
CausalStream.prototype._write = function(chunk, encoding, callback) {
    var tei = JSON.parse(chunk);
    if (tei._type == 'INS'){ // #1 insert operation
	var causal = {_e: tei._data._i._s[tei._data._i._s.length - 1],
		      _c: tei._data._i._c[tei._data._i._c.length - 1]};
	if (!this._ivv.isLower(causal)){ // #1a handle double reception
	    this._ivv.incrementFrom(causal); // #1b causality
	    // #1c Propagate the message to the application
	    this._parent.emit('remoteInsert', tei._data._e, tei._data._i);
	    // #1d Check if some deletes are ready now
	    for (var i=0; i<this._buffer.length; ++i){
		var operation = this._buffer[i];
		if (this._ivv.isRdy(operation._causal)){
		    // 1e Propagate the remove operation to the application
		    this._parent.emit('remoteRemove', operation._i);
		    this._buffer.splice(i, 1);
		    --i;
		};
	    };
	};
    };
    if (tei._type == 'REM'){ // #2 delete operation
	var causal = {_e: tei._data._s[tei._data._s.length - 1],
		      _c: tei._data._c[tei._data._c.length - 1]};
	if (this._ivv.isRdy(causal)){ // #2a look for its target
	    // #2b Propagate the remove operation to the application
	    this._parent.emit('remoteRemove', tei._data);
	}else{
	    // # 2c delay the operation
	    var operation = {_causal:causal, _i:tei._data};
	    this._buffer.push(operation);
	};
    };
    callback();
};

module.exports = CausalStream;
