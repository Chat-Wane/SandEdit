var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var c = require('./config.js');
var VVwE = require('causaltrack').VVwE;

util.inherits(Peer, EventEmitter);

/*!
 * \class Peer
 * \brief Provide a reliable and scalable communication assuming a 50+
 * percentage of travelling coverage by the operations
 */
function Peer(membership, application, siteId){
    EventEmitter.call(this);
    // #1 init the peer
    // #1a the application layer
    this._application = application;
    this._application.setCommunication(this);

    // #1a consistency guarentees
    this._vvwe = new VVwE(siteId);

    // #1b communication
    this._membership = membership;
    this._socket = dgram.createSocket('udp4');
    this._socket.bind(this._membership._port, this._membership._localIP);

    // #1c measurements
    this._msgSize = 0;
    this._msgCount = 0;
    this._measurements = [];
    this._checkpoint = 0;

    var self=this;    
    // #2 local update event
    this.on("local", function(operation){
	self._vvwe.increment();
	var msg = new Buffer(JSON.stringify({_operation: operation,
					     _hop: c.HOP}));
	self.broadcast(msg);
	if (this._application._lseq.length==c.CHECKPOINTS[this._checkpoint]){
	    this._measurements[this._checkpoint]={_msgCount:this._msgCount,
						  _msgSize :this._msgSize};
	    this._checkpoint += 1;
	};
    });
    
    // #3 receive update event
    // #3a redirect the message to the proper event
    this._socket.on('message', function(msg, info){
	var realMsg = JSON.parse(msg);
	if ("_operation" in realMsg){
	    // #3a.  notify the receipt of a new update
	    self.receive(realMsg._operation);
	    // #3a.. resend to my neighbours
	    if (("_hop" in realMsg) && (realMsg._hop > 0)){
		realMsg._hop = realMsg._hop - 1;
		var resendMsg = new Buffer(JSON.stringify(realMsg));
		self.broadcast(resendMsg);
	    };
	} else if ("_request" in realMsg){
	    self.emit("operationRequest",
		      realMsg._request,
		      {_address:info.address, _port:info.port});
	} else if ("_response" in realMsg){
	    for (var i=0; i<realMsg._response.length; ++i){
		self.receive(realMsg._response[i]);
	    };
	};
    });
    
    this.on("operationRequest", function(delta, address){
	var result = [];
	for (var i = 0; i<delta.length; ++i){
	    for (var j = 0; j<delta[i]._c.length; ++j){
		var couple = {_e:delta[i]._e, _c:delta[i]._c[j]};
		if (self._vvwe.isLower(couple)){//operation exists
		    var op = self._application.getOperation(couple);
		    if (op !== null){
			result.push(op);
		    };
		};
	    };
	};
	var msg = new Buffer(JSON.stringify({_response:result}));
	self._socket.send(msg,0,msg.length,
			  address._port,address._address,null);
    });
    
    // #antientropy
    setInterval(function(){
	var n = self._membership.neighbours(c.NEIGHBOURS);
	var keys = Object.keys(self._vvwe._v);
	var partitionSize = Math.ceil( keys.length / n.length );
	var partitionNumber = 0;
	if ( partitionSize > 0){
	    partitionNumber = Math.ceil( keys.length / partitionSize );
	};
	for (var i = 0; i < partitionNumber; ++i){
	    var result = [];
	    for (var j=0; j < partitionSize; ++j){
		var entry = keys[j*partitionNumber + i];
		if((entry in self._vvwe._x) &&
		   self._vvwe._x[entry].length > 0){
		    var couple = {_e:keys[i], _c:(self._vvwe._x[entry]) };
		    result.push(couple);
		};
	    };
	    if (result.length > 0){
		msg = new Buffer(JSON.stringify({_request:result}));
		for (var k=0; k < c.AENEIGHBOURS;++k){// send to part of neighb
		    if ((i+k) in n){
			self._msgSize += msg.length; // metrology
			self._msgCount += 1; // metrology
			self._socket.send(msg,0,msg.length,
					  n[i+k]._port,n[i+k]._ip,null);
		    };
		};
		
	    };
	};
    }, c.ANTIENTROPY); // End anti-entropy

//     // anti entropy of random column
//     setInterval(function(){
// 	var keys = Object.keys(self._vvwe._v);
// 	var row = Math.floor(Math.random()*keys.length);
// 	var result = [];
// 	if (self._vvwe._x[keys[row]].length > 0){
// 	    var couple = {_e:keys[row], _c:(self._vvwe._x[keys[row]]) };
// 	    result.push(couple);
// 	};
// 	if (result.length > 0){
// 	    var msg = new Buffer(result);
// 	    self.broadcast(msg);
// 	};
//     }, 4000); // End anti-entropy with random column
};

Peer.prototype.receive = function(operation){
    var couple = {_e: operation._i._s[operation._i._s.length - 1],
		  _c: operation._i._c[operation._i._c.length - 1]};
    if (!this._vvwe.isLower(couple)){ // new data
	this._vvwe.incrementFrom(couple);
	this._application.emit("deliver", operation);
	if (this._application._lseq.length==c.CHECKPOINTS[this._checkpoint]){
	    this._measurements[this._checkpoint]={_msgCount:this._msgCount,
						  _msgSize :this._msgSize};
	    this._checkpoint += 1;
	};
    };
};

Peer.prototype.broadcast = function(msg){
    this._msgSize += (c.NEIGHBOURS * msg.length); // metrology
    this._msgCount += c.NEIGHBOURS; // metrology
    var n = this._membership.neighbours(c.NEIGHBOURS);
    for (var i=0;i<n.length;++i){
	this._socket.send(msg,0,msg.length,n[i]._port,n[i]._ip,null);
    };
};

module.exports = Peer;
