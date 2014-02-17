var hashes = require('hashes');
var dgram = require('dgram');

function Peer(port, maxViewSize, tick){
    this._port = port;
    this._view = new hashes.HashTable();
    this._maxViewSize = maxViewSize;
    this._tick = tick;
    this._udp = dgram.createSock('udp4');
    this._udp.bind(this._port);
    this._udp.on("message", function(msg, rinfo){
	// #1 Request neighbours
	// #2 Regular message
    });

    this._udp.on("listening", function(){
	console.log("Peer is awake, listening on "+ this._port);
    });
};

Peer.prototype.scramble() = function(){

};

Peer.prototype.removeOldItems = function(){

};

Peer.prototype.removeHead = function(){

};

Peer.prototype.removeAtRandom = function(){

};
