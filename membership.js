var Netmask = require('netmask').Netmask;
var fs = require('fs');
var os = require('os');

var c = require('./config.js');

function Membership(subnet, port){
    this._listIP = [];
    this.initListIP();

    this._subnet = subnet;
    this._port = port;
    this._localIP = this.localIP();

    this._neighbours = [];
    this._nbCall = 0;

    this.neighbours(c.NEIGHBOURS);
};

/*!
 * \brief get a list of adresses corresponding to current neighbours 
 * \k the number of neighbours
 */
Membership.prototype.neighbours = function(k){
    if ((this._nbCall%c.MBSPCALL)==0){
     	this._neighbours = this.newNeighbours(k);
	this._nbCall = 0;
    };
    this._nbCall = this._nbCall + 1;
    return this._neighbours;
};

Membership.prototype.initListIP = function(){
    var data = fs.readFileSync(c.ipFile);
    var ips = data.toString().split('\n');
    for (var i = 0; i < ips.length; ++i){
	if (ips[i] != ""){
	    this._listIP.push(ips[i]);
	};
    };
};

Membership.prototype.newNeighbours = function(k){
    var listNeighbours = [];
    while (listNeighbours.length < k){
	var port = c.PORT+ Math.floor(Math.random()*c.PEERS);
	var ip = this._listIP[Math.floor(Math.random()*this._listIP.length)];
	// a check if "wazn't me"
	if ((ip != this._localIP) || (port != this._port)){
	    // b check if no double
	    var duplicate = false;
	    var i = 0;
	    while((!duplicate) && (i < listNeighbours.length)){
		if ((listNeighbours[i]._port == port) &&
		    (listNeighbours[i]._ip == ip)){
		    duplicate = true;
		};
		++i;
	    };
	    if (!duplicate){
		var couple = {_ip:ip, _port:port };
		listNeighbours.push(couple);
	    };
	};
    };
    return listNeighbours;
};


/** from smokesignal, slightly different though **/
Membership.prototype.localIP = function() {
    //Determine my IP
    var interfaces = os.networkInterfaces()
    , block = new Netmask(this._subnet+"/"+c.MASK)
    , ip
    for(var name in interfaces) {
	for(var i=0 ; i < interfaces[name].length; ++i) {
	    if(interfaces[name][i].family == 'IPv6') continue
	    if(!block.contains(interfaces[name][i].address))
	    { continue;}
	    return interfaces[name][i].address
	}
    }
    throw new Error('Couldn\'t determine IP address')
};


module.exports = Membership;
