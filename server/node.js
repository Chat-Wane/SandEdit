var smoke = require('smokesignal');
var SSeq = require('./sseq.js');

/*!
 * \class Node
 * \brief embed the communication and the application layers
 * \param id the unique identifier of the site
 * \param localPort the port used by the local site
 * \param remotePort the port a connected remote site 
 */
function Node(id, localPort, remotePort){

    var self = this;
    this._s = new SSeq(id);
    this._node = smoke.createNode({
	port: localPort
	, address: smoke.localIp('127.0.0.1/255.0.0.0')
	, seeds: [{port: remotePort, address:'127.0.0.1'}]
    });

    ///////////
    this._s._emitter.on("insert", function(e,i){ // from sseq -> node
	self._node.emit('INS',e,i);
    });
    
    this._s._emitter.on("remove", function(i){ // from sseq -> node
	self._node.emit('DEL',i);
    });
    ///////////
    ///////////
    
    console.log('Port', this._node.options.port)
    console.log('IP', this._node.options.address)
    console.log('ID', this._node.id)

    console.log('Connecting...');
    
    ///////////
    ///////////
    this._node.on('connect', function() {
	console.log('Connection established.');    
    });
    
    this._node.on('disconnect', function() {
	console.log('Disconnected.');
    });
    
    this._node.on('error', function(e) {throw e});
    
    this._node.on('insert', function(e, i){ // from node -> sseq
	var ei = self._s._array.insert(e,i);
	self._s._vector.increment();
	self._s.push(JSON.stringify({_type:'INS',
			       _causal:{_e: self._s._vector._e,
					_c: self._s._vector._v[
					    self._s._vector._e]},
			       _data:ei}));
    });
    
    this._node.on('remove', function(i){ // from node -> sseq
	var id = self._s._array.remove(i);
	var couple = {_e: id._s[id._s.length - 1],
		      _c: id._c[id._c.length - 1] };
	self._s.push(JSON.stringify({_type:'REM',
				     _causal: couple,
				     _data: id}));
    });
    ////////////
    ////////////

    self._s.pipe(this._node.broadcast).pipe(self._s);
    this._node.start();    
};

module.exports = Node;
