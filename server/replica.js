var smoke = require('smokesignal');
var Node = smoke.Node;
var LSEQArray = require('lseqarray');
var CausalStream = require('./causalstream.js');


/*!
 * \class Node
 * \brief embed the communication and the application layers
 * \param id the unique identifier of the site
 * \param localPort the port used by the local site
 * \param remotePort the port a connected remote site 
 */
function Replica(site, maxSite,
		 localAddress, localMask, localPort,
		 remoteAddress, remotePort){
    var opts = {port: localPort,
		address: smoke.localIp(localAddress+"/"+localMask),
		seeds: [{port: remotePort, address:remoteAddress}]};
    Node.call(this, opts);
    var self = this;
    
    this._array = new LSEQArray(site);
    this._causalStream = new CausalStream(this, site, maxSite);
    
    
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


module.exports = Replica;
