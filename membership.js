var Netmask = require('netmask');
var c = require('./config.js');

function Membership(subnet, port){
    this._port = port;
    this._subnet = subnet;
    this._neighbours = [];
    this._nbCall = 0
};

/*!
 * \brief get a list of adresses corresponding to current neighbours 
 * \k the number of neighbours
 */
Membership.prototype.neighbours = function(k){
    if ((this._nbCall%c.MBSPCALL)==0){
	this._neighbours = this.newNeighbours(k);
    };
    this._nbCall = this._nbCall + 1;
    return this._neighbours;
};

Membership.prototype.newNeighbours = function(k){
    var listNeighbours = [];
    while (listNeighbours.length < k){
	var ip = c.IPROOT +  Math.floor(c.IPSTART + Math.random()*c.IPRANGE); 
	var port = c.PORT+ Math.floor(Math.random()*c.PEERS);
	// a check if "wazn't me"
	if ((ip != this.localIP) || (port != this._port)){
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
    , block = new Netmask(this._subnet)
    , ip
    for(var name in interfaces) {
	if(this.remoteAddress) break
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
