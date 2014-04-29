
/**
 * \class VV
 * \brief the well-known version vector that characterizes causality between
 * updates
 * \param e the entry chosen by the local site (1 entry <-> 1 site)
 */
function VV(e){
    this._e = e;
    this._v = [];
};


/**
 * \brief increment the entry of the vector on local update
 */
VV.prototype.increment = function(){
    if (!(this._e in this._v)){
	this._v[this._e] = 0;
    };
    this._v[this._e] = this._v[this._e] + 1;
};


/**
 * \brief increment from a remote version vector supposedly ready
 * \param vv the received version vector
 */
VV.prototype.incrementFrom = function (vv){
    if (!(vv._e in this._v)){
	this._v[vv._e] = 0;
    };
    this._v[vv._e] = vv._v[vv._e]; // if ready, it means + 1 on the entry
};


/**
 * \brief check if the target VV is causally ready 
 * \param vv the version vector to check
 */
VV.prototype.isRdy = function(vv){
    var ready = true;

    // #1 verify that all entry of this._v exists in vv
    var keys = Object.keys(this._v);
    var i = 0;
    while (ready && i<keys.length){
	if (!(keys[i] in vv._v) ||
	    (this._v[keys[i]] > vv._v[keys[i]])){
	    ready = false;
	};
	++i;
    };

    // #2 verify that all entry of vv._v exists in this._v
    var keys = Object.keys(vv._v);
    var i = 0;
    while (ready && i<keys.length){
	if ((keys[i]!=vv._e) &&
	    (!(keys[i] in this._v) ||
	     (this._v[keys[i]] > vv._v[keys[i]]))){
	    ready = false;
	};
	++i;
    };

    ready = (ready &&
	     ((vv._v[vv._e]==1) ||
	      ((vv._e in this._v) && (vv._v[vv._e] == (this._v[vv._e] +1) ))));
    
    return ready;
};

/**
 * \brief check if the target vv is strictly lower than the local one. Probably
 * meaning that the information linked to it has already been delivered
 * \param vv te version vector to check
 */
VV.prototype.isLower = function(vv){
    return ((vv._e in this._v) && (vv._v[vv._e] <= this._v[vv._e]));
};



module.exports = VV;
