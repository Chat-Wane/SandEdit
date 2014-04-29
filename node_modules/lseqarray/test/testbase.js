var expect = require('expect.js');
var Mocha  = require('mocha');
var BI = require('BigInt');

var Base = require('../lib/base.js');
var ID = require('../lib/identifier.js');

describe('base.js', function() {
    
    describe('base', function(){
	it('trivial test of setup', function(){
	    var base = new Base(1337);
	    expect(base._b).to.be.eql(1337);
	});
    });
    
    describe('getBitBase', function(){
	it('trivially return the bit size of certain level', function(){
	    var base = new Base(42);
	    expect(base.getBitBase(5)).to.be.eql(47);
	});
    });

    describe('getSumBit', function(){
	it('should return number of bits from lvl-0 to lvl-X', function(){
	    var base = new Base(5);
	    expect(base.getSumBit(0)).to.be.eql(base._b); // 5
	    expect(base.getSumBit(1)).to.be.eql(base._b*2+1) // 11
	    expect(base.getSumBit(2)).to.be.eql(base._b*3+3) // 18
	});
    });

    describe('getInterval', function(){
	it('should return an empty interval at lvl 0', function(){
	    var base = new Base(3);
	    var id1 = new ID(BI.int2bigInt(17,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,1]
	    var id2 = new ID(BI.int2bigInt(31,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,15]
	    expect(BI.negative(base.getInterval(id1,id2,0))).to.be.eql(1);
	});
	
	it('should return an interval at level 1 of 13', function(){
	    var base = new Base(3);
	    var id1 = new ID(BI.int2bigInt(17,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,1]
	    var id2 = new ID(BI.int2bigInt(31,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,15]
	    expect(BI.equalsInt(base.getInterval(id1,id2,1),13)).to.be.ok();
	});

	it('should return an interval at level 1 of 14', function(){
	    var base = new Base(3);
	    var id1 = new ID(BI.int2bigInt(1,base.getSumBit(0)),
			     [0],[0]); // [1]
	    var id2 = new ID(BI.int2bigInt(31,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,15]
	    expect(BI.equalsInt(base.getInterval(id1,id2,1),14)).to.be.ok();
	});

	it('should return an interval at level 1 of 11', function(){
	    var base = new Base(3);
	    var id1 = new ID(BI.int2bigInt(20,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,4] precedes the [1,3]
	    var id2 = new ID(BI.int2bigInt(19,base.getSumBit(1)),
			     [0,0],[0,0]); // [1,3]
	    expect(BI.equalsInt(base.getInterval(id1,id2,1),11)).to.be.ok();
	});

    });
});
