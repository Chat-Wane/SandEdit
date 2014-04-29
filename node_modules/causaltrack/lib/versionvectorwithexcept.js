
/**
 * \class VVwE
 * \brief class version vector with exception keeps track of events in a 
 * concise way
 * \param e the entry chosen by the local site (1 entry <-> 1 site)
 */
function VVwE(e){
    this._e = e;
    this._v = []; // vector
    this._x = []; // exceptions

    this._v[this._e] = 0;
    this._x[this._e] = [];
};


/**
 * \brief increment the entry of the vector on local update
 */
VVwE.prototype.increment = function(){
    this._v[this._e] = this._v[this._e] + 1;
};


/**
 * \brief increment from a remote operation
 * \param ec the entry and clock of the received event to add supposedly rdy
 */
VVwE.prototype.incrementFrom = function (ec){
    // #0 if the entry does not exist, initialize it
    if (!(ec._e in this._v)){ 
	this._v[ec._e]= 0
	this._x[ec._e]= []
    };
    // #1 check if the value is not in the exception vector
    if (ec._c < this._v[ec._e]){
	var index = this._x[ec._e].indexOf(ec._c);
	if (index>=0){ // exception found
	    this._x[ec._e].splice(index, 1);
	};
    };
    // #2 if the value is +1 compared to the current value of the vector
    if (ec._c == (this._v[ec._e] + 1)){
	this._v[ec._e] += 1;
    };
    // #3 otherwise exception are made
    if (ec._c > (this._v[ec._e] + 1)){
	for (var i = (this._v[ec._e] + 1); i<ec._c; ++i){
	    this._x[ec._e].push(i);
	};
	this._v[ec._e] = ec._c;
    };
};


/**
 * \brief check if the argument are causally ready regards to this vector
 * \param ec the site clock that happen-before the current event
 */
VVwE.prototype.isRdy = function(ec){
    return ((ec === null) ||
	    ((ec._e in this._v) &&
	     ((ec._c <= this._v[ec._e]) &&
	      (this._x[ec._e].indexOf(ec._c)<0))));
};

/**
 * \brief check if the message contains information already delivered
 * \param ec the site clock to check
 */
VVwE.prototype.isLower = function(ec){
    return ((ec._e in this._v) &&
	    ((ec._c <= this._v[ec._e]) &&
	     (this._x[ec._e].indexOf(ec._c)<0)));
};

VVwE.prototype.toString = function(){
    var keys = Object.keys(this._v);
    var result = "";
    for (var i=0; i<keys.length; ++i){
	result = result + "("+keys[i]+": "+this._v[keys[i]] +", "+
	    JSON.stringify(this._x[keys[i]]) + ")";
    };
    return result;
};

module.exports = VVwE;

