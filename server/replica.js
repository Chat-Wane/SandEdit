var smoke = require('smokesignal');
var nssocket = require('nssocket');
var Node = require('smokesignal/lib/node');
var LSEQArray = require('lseqarray');
var CausalStream = require('./causalstream.js');
var util = require('util');
util.inherits(Replica, Node);

/*!
 * \class Node
 * \brief embed the communication and the application layers
 * \param id the unique identifier of the site
 * \param localPort the port used by the local site
 * \param remotePort the port a connected remote site 
 */
function Replica(site, maxSite,
		 localAddress, localPort, localMask,
		 remoteAddress, remotePort){
    var opts = {port: localPort,
		address: smoke.localIp(localAddress+"/"+localMask),
		seeds: [{port: remotePort, address:remoteAddress}]};


		   
    Node.call(this, opts);
    var self = this;
    
    this._array = new LSEQArray(site);
    this._causalStream = new CausalStream(this, site, maxSite);

    // #1 State transfer    
    this.peers.on('add', function(peer) {
	if (self.peers.list.length == 1){
	    peer.socket.send(['replica', 'requestState']);
	    
	    peer.socket.data(['replica', 'requestState'], function(){
		peer.socket.send(['replica', 'state'],
				 {_array:self._array,
				  _causal:self._causalStream._ivv});
	    });
	    peer.socket.data(['replica', 'state'], function(data){
		// #2 check if there is no operation in data
		var empty = true;
		for (var i=0; i < data._causal._v.length; ++i){
		    if (data._causal._v[i] != 0){
			empty = false;
		    };
		};
		if (!(empty)){ 
		    // #3a copy the array
		    for (var i=1; i <= data._array.length; ++i){
			var e = data._array[i]._e;
			var id = data._array[i]._i;
			this.emit('remoteInsert', e ,id);
		    };
		    // #3c copy the causality array
		    var entry = this._causalStream._ivv._e;
		    this._causalStream._ivv = data._causal;
		    this._causalStream._ivv._e = entry;
		};
	    });
	};
    });
    
    // #2 Local and Remote Events
    this.on('insert', function(e, i){ // from node -> sseq
	var ei = self._array.insert(e,i);
	self._causalStream.push(JSON.stringify({_type: 'INS',	
						_data: ei}));
    });
    
    this.on('remove', function(i){ // from node -> sseq
	var id = self._array.remove(i);
	self._causalStream.push(JSON.stringify({_type: 'REM',
						_data: id}));
    });
    
    this.on('remoteInsert', function(e,i){
	var index = this._array.applyInsert(e,i);
	self.emit('INS', e, index);
    });
    
    this.on('remoteRemove', function(i){
	var index = this._array.applyRemove(i);
	self.emit('REM', index);
    });

    this.on('connect', function() {
	console.log('Connection established.');    
    });
    
    this.on('disconnect', function() {
	console.log('Disconnected.');
    });
    
    this.on('error', function(e) {throw e});
    
    this._causalStream.pipe(this.broadcast).pipe(this._causalStream);
    
    this.start();
};

Replica.prototype.toString = function (){
    var string = '';
    for (var i =1; i<=this._array.length; ++i){
	var ei = this._array.get(i);
	string = string.concat(ei._e);
    };
    return string;
};

module.exports = Replica;
