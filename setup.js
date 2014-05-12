var fs = require('fs');
var c = require('./config.js');
var M = require('./membership.js');
var A = require('./application.js');
var P = require('./peer.js');

var peers = [];


// #A create all peers
for (var i=0; i < c.PEERS; ++i){
    setTimeout( createPeer, i*2000, i);
};

function createPeer(i){
   // #1 create membership
    var m = new M(c.SUBNET, c.PORT+i);

    var uid = c.PEERS*(parseInt(m._localIP.split('.')[3]))+i;

    // #2 create application
    var a = new A(uid);
    
    // #3a create peer and establish sockets
    var p = new P(m, a, uid);
    p.start();
    // #3b register the peer
    peers.push(p);
};


setTimeout(exportNeighbours, Math.floor(c.STARTTIME/2));

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
		if (peer == 0){
		    exportMetadata();
		};
		console.log("");
		console.log(peer+"._lseq.length : "+
			    peers[peer]._application._lseq.length);
		console.log(peer+"._vvwe : "+
			    peers[peer]._vvwe.toString());
	    }, c.PARTITIONTIME+c.STOPTIME, j);
	};
    };
};


// #C exporting the data to files
function exportNeighbours(){
    var neighboursList = [];
    for (var i = 0; i < peers.length; ++i){
	var neighboursString = "" ;
	for (var j = 0;  j < peers[i].peers.list.length; ++j){
	    neighboursString = 
		peers[i].id+";"+
		peers[i].peers.list[j].id;
	    neighboursList.push(neighboursString);
	};
    };
    fs.writeFile(c.dataFolder+
		 "neighbours"+peers[0]._vvwe._e+
		 ".csv", neighboursList.join("\n")+"\n", function(err){});
};

function exportMetadata(){
    var countMsgs = [];
    var sizeMsgs = [];
    for (var j = 0; j < peers[0]._measurements.length; ++j){
	var countLine = [];
	var sizeLine = [];
	for (var i = 0; i < peers.length ; ++i){
	    countLine.push(peers[i]._measurements[j]._msgCount);
	    sizeLine.push(peers[i]._measurements[j]._msgSize);
	};
	countMsgs.push(countLine.join(" "));
	sizeMsgs.push(sizeLine.join(" "));
    };
    fs.writeFile(c.dataFolder+
		 'countMsg'+ peers[0]._vvwe._e, countMsgs.join("\n"),
		 function (err) {
		     if (err){
			 console.log("Append error: countMsg file");
		     };
		 });
    fs.writeFile(c.dataFolder+
		 'sizeMsg'+peers[0]._vvwe._e, sizeMsgs.join("\n"),
		 function (err) {
		     if (err){
			 console.log("Append error: sumSizeMsg file");
		     };
		 });
};
