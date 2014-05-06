var smoke = require('smokesignal');
var Node = require('smokesignal/lib/node.js');
var util = require('util');

var SimpleStream = require('./simplestream.js');
var c = require('./config.js');
var VVwE = require('causaltrack').VVwE;

util.inherits(Peer, Node);

/*!
 * \class Peer
 * \brief Provide a reliable and scalable communication assuming a 50+
 * percentage of travelling coverage by the operations
 */
function Peer(membership, application, siteId){
    var n = membership.neighbours();
    var seedlist = [];
    for (var i = 0; i < n.length; ++i){
	seedlist.push({port:n[i]._port, address:n[i]._ip });
    };
    var opts = {
	port: membership._port,
	address: membership._localIP,
	seeds: seedlist,
	minPeerNo: c.NEIGHBOURS,
	maxPeerNo: c.NEIGHBOURS
    };
    Node.call(this,opts);
    // #1 init the peer
    // #1a the application layer
    this._application = application;
    this._application.setCommunication(this);

    // #1a consistency guarentees
    this._vvwe = new VVwE(siteId);

    // #1b communication
    this._simpleStream = new SimpleStream(this);
    this._simpleStream.pipe(this.broadcast).pipe(this._simpleStream);
    this._membership = membership;
    
    // #1c measurements
    this._msgSize = 0;
    this._msgCount = 0;
    this._measurements = [];
    this._checkpoint = 0;
    
    var self=this;    
    // #2 local update event
    this.on("local", function(operation){
	self._vvwe.increment();
	var msg = new Buffer(JSON.stringify({_operation: operation}));
	if (Math.random() > 0.01){
	    self._broadcast(msg);
	};
	// metrology
	if (this._application._lseq.length==c.CHECKPOINTS[this._checkpoint]){
	    this._measurements[this._checkpoint]={_msgCount:this._msgCount,
						  _msgSize :this._msgSize};
	    this._checkpoint += 1;
	};
    });
    
    // #3 receive update event
    // #3a redirect the message to the proper event
    this.on('message', function(msg){
	var realMsg = JSON.parse(msg);
	if ("_operation" in realMsg){
	    // #3a.  notify the receipt of a new update
	    self.receive(realMsg._operation);
	} else if ("_response" in realMsg){
	    for (var i=0; i<realMsg._response.length; ++i){
		self.receive(realMsg._response[i]);
	    };
	};
    });
    
    this.peers.on('add', function(peer) {
	peer.socket.data(['peer', 'operationRequest'], function(realMsg){
	    var realMsg = JSON.parse(msg);
	    self.emit("operationRequest",
		      realMsg._request,
		      peer);
	});
	peer.socket.data(['peer', 'operationResponse'], function(delta){
	    self.emit("message", delta);
	});
    });

    this.on("operationRequest", function(delta, peer){
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
	var msg = JSON.stringify({_response:result});
	peer.socket.send(['peer','operationResponse'], msg);
    });
    
    // #antientropy
    setInterval(function(){
	var n = self.peers.list;
	var keys = Object.keys(self._vvwe._v);
	var result = [];
	for (var i = 0; i < keys.length; ++i){
	    var entry = keys[i];
	    if((entry in self._vvwe._x) &&
	       self._vvwe._x[entry].length > 0){
		var couple = {_e:keys[i], _c:(self._vvwe._x[entry]) };
		result.push(couple);
	    };
	};
	if (result.length > 0){
	    msg = JSON.stringify({_request:result});
	    for (var k=0; k < self.peers.list.length ;++k){
//		self._msgSize += msg.length; // metrology
//		self._msgCount += 1; // metrology
		self.peers.list[k].socket.send(['peer','operationRequest'],
					       msg);
	    };
	};
    }, c.ANTIENTROPY); // End anti-entropy

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

Peer.prototype._broadcast = function(msg){
    this._msgSize += (c.NEIGHBOURS * msg.length); // metrology
    this._msgCount += c.NEIGHBOURS; // metrology
    this._simpleStream.push(msg);
};

module.exports = Peer;
