var util = require('util');
require('lseqarray/lib/base.js').getInstance(8);
var LSEQ = require('lseqarray');
var EventEmitter = require('events').EventEmitter;
util.inherits(Application, EventEmitter);

function Application(site){
    EventEmitter.call(this);

    this._lseq = new LSEQ(site);
    this._communication = null;
    var self = this;
    
    this.on('deliver', function(operation){
	self._lseq.applyInsert(operation._e, operation._i);
    });
    
    this.on('update', function(){
	// at the end
	var ei=self._lseq.insert("A", self._lseq.length);
	// randomly
	// var ei=selq._lseq.insert("A",
	//			 Math.floor(Math.random()*self._lseq.length));
	self._communication.emit("local", ei);
    });
};

Application.prototype.setCommunication = function(communication){
    this._communication = communication;
};

Application.prototype.getOperation = function(couple){
    var found = false;
    var i = this._lseq.length;
    var result = null;
    while (!found && i>0){
	if ((this._lseq._array[i]._i._s[this._lseq._array[i]._i._s.length-1]==
	     couple._e) && 
	    (this._lseq._array[i]._i._c[this._lseq._array[i]._i._c.length-1]== 
	     couple._c)){
	    found = true;
	    result = this._lseq._array[i];
	};
	--i;
    };
    return result;
};

module.exports = Application;
