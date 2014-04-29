var c = require('./config.js');
var M = require('./membership.js');
var A = require('./application.js');
var P = require('./peer.js');

var peers = [];

// #A create all peers
for (var i=0; i < c.PEERS; ++i){

    // #1 create membership
    var m = new M(c.SUBNET, c.PORT+i);
    
    // #2 create application
    var a = new A(c.PORT+i);
    
    // #3a create peer and establish sockets
    var p = new P(m, a, c.PORT+i);
    // #3b register the peer
    peers.push(p);
};

// #B create the operation events
for (var i=0; i<c.PARTITIONTIME;++i){
    setTimeout(partition, c.STARTTIME+
	       Math.floor(c.RUNNINGTIME/c.PARTITIONTIME * i), i );
};

function partition(i){
    process.stdout.write("{"+i+"}");
    for (var j = 0; j < Math.floor(c.OPERATIONS/c.PARTITIONTIME); ++j){
	setTimeout(function(peer){
	    peers[peer]._application.emit('update');
	},
		   Math.floor(Math.random()*c.RUNNINGTIME/c.PARTITIONTIME),
		   Math.floor(Math.random()*c.PEERS));
    };
    
    if (i==(c.PARTITIONTIME-1)){
	for (var j=0; j<c.PEERS; ++j){
	    setTimeout(function(peer){
		console.log("");
		console.log(peer+"._lseq.length : "+
			    peers[peer]._application._lseq.length);
		console.log(peer+"._vvwe : "+
			    peers[peer]._vvwe.toString());
	    }, c.PARTITIONTIME+c.STOPTIME, j);
	};
    };
};
