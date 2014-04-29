
/**
 * \class IVV
 * \brief the interval version vector useful for tracking semantically
 * dependent events only. Making independant events non-blocking 
 * \param e the entry chosen by the local site (1 entry <-> 1 site)
 */
function IVV(e){
    this._e = e;
    this._v = []; // vector
    this._o = []; // omen
    this._v[e] = new Number(0);
    this._o[e] = new Number(0);
};


/**
 * \brief increment the entry of the vector on local update
 */
IVV.prototype.increment = function(){
    this._v[this._e] = this._v[this._e] + 1;
};


/**
 * \brief increment from a remote operation
 * \param ec the entry and clock of the received event to add supposedly rdy
 */
IVV.prototype.incrementFrom = function (ec){
    if (!(ec._e in this._v)){ // if the entry does not exist, initialize it
	this._v[ec._e]= new Number(0);
	this._o[ec._e]= new Number(0);
    };
    if (ec._c > this._v[ec._e]){// update the omen vector
	this._o[ec._e] = this._o[ec._e] +
	    Math.pow(2,ec._c-this._v[ec._e]-1);//set bit @ index
    };
    while(((this._o[ec._e]%2) != 0)&&(this._o[ec._e]!=0)){ // shift if needed
	this._v[ec._e] = this._v[ec._e] + 1;
	this._o[ec._e] = Math.floor(this._o[ec._e] / 2);
    };
};


/**
 * \brief check if this vector is causally ready 
 * \param ec the site clock that happen-before the current event
 */
IVV.prototype.isRdy = function(ec){
    return ((ec === null) ||
	    ((ec._e in this._v) &&
	    ((this._v[ec._e] >= ec._c) ||
	    ((this._o[ec._e] / Math.pow(2,ec._c-this._v[ec._e]-1))%2 == 1 ))));
};

/**
 * \brief check if the message contains information already delivered
 * \param ec the site clock to check
 */
IVV.prototype.isLower = function(ec){
    return ((ec._e in this._v) &&
	    ((ec._c <= this._v[ec._e]) ||
	    ((this._o[ec._e] /Math.pow(2,ec._c-this._v[ec._e]-1))%2 == 1)));
};

IVV.prototype.toString = function(){
    var keys = Object.keys(this._v);
    var result = "";
    for (var i=0; i<keys.length; ++i){
	result = result + "("+keys[i]+": "+this._v[keys[i]] +", "+
	    this._o[keys[i]] + ")";
    };
    return result;
};

module.exports = IVV;

