var expect = require('expect.js');
var Mocha = require('mocha');

var IVV = require('../lib/intervalversionvector.js');

describe('intervalversionvector.js', function() {

    describe('ivv', function(){
	it('init the entries to zero', function(){
	    var ivv = new IVV(13);
	    expect(ivv._v[ivv._e]).to.be.eql(0);
	    expect(ivv._o[ivv._e]).to.be.eql(0);
	});
    });
    
    describe('increment', function(){
	it('increment the entry', function(){
	    var ivv = new IVV(13);
	    ivv.increment();
	    expect(ivv._v[ivv._e]).to.be.eql(1);
	});

	it('omen vector stay equal to zero for my entry', function(){
	    var ivv = new IVV(13);
	    ivv.increment();
	    ivv.increment();
	    expect(ivv._o[ivv._e]).to.be.eql(0);
	});
    });

    describe('incrementfrom', function(){
	it('increment the entry from another vv', function(){
	    var ivv = new IVV(13);
	    var rIVV = new IVV(4);
	    rIVV.increment();
	    ivv.incrementFrom({_e: rIVV._e, _c:rIVV._v[rIVV._e] });
	    expect(rIVV._v[rIVV._e]).to.be.eql(1);
	    expect(ivv._v[rIVV._e]).to.be.eql(rIVV._v[rIVV._e]);
	});

	it('increment from anywhere does not affect my entry', function(){
	    var ivv = new IVV(13);
	    var rIVV = new IVV(4);
	    rIVV.increment();
	    ivv.incrementFrom({_e: rIVV._e, _c:rIVV._v[rIVV._e] });
	    expect(ivv._v[ivv._e]).to.be.eql(0);
	});

	it('a message is lost, omen takes a little advance', function(){
	    var ivv = new IVV(13);
	    var rIVV = new IVV(4);
	    rIVV.increment();
	    rIVV.increment();
	    expect(rIVV._v[rIVV._e]).to.be.eql(2);
	    ivv.incrementFrom({_e: rIVV._e, _c:rIVV._v[rIVV._e] });
	    expect(ivv._o[rIVV._e]).to.be.eql(2); // 00010 <-
	});
    });
    
    describe('isReady', function(){
	it('check if an operation depending on another is ready', function(){
	    var ivv = new IVV(13);
	    ivv.increment();
	    var target = {_e:ivv._e, _c:ivv._v[ivv._e]};
	    expect(ivv.isRdy(target)).to.be.ok();
	    var target2 = {_e:ivv._e, _c:(ivv._v[ivv._e]+1)}; // does not exist
	    expect(ivv.isRdy(target2)).to.not.be.ok();
	});
	
	it('check if an operation independant of any other is rdy',function(){
	    var ivv = new IVV(13);
	    var c = null;
	    expect(ivv.isRdy(c)).to.be.ok();
	});

	it('check in the omen vector for target operation', function(){
	    var ivv = new IVV(13);
	    var ivv2 = new IVV(0);
	    ivv2.increment();
	    ivv2.increment();
	    var c = {_e: ivv2._e, _c: ivv2._v[ivv2._e]};
	    ivv.incrementFrom(c);
	    // another operation arrive depending on operation identifier by c;
	    expect(ivv.isRdy(c)).to.be.ok();
	});
    });
    
    describe('isLower', function(){
	it('check if the ev has been seen before or not', function(){
            var ivv = new IVV(13);
            var ivv2 = new IVV(0);
	    ivv2.increment();
	    var c = {_e : ivv2._e , _c:ivv2._v[ivv2._e]};
            expect(ivv.isLower(c)).to.not.be.ok();
            ivv.incrementFrom(c);
            expect(ivv.isLower(c)).to.be.ok();
        });

	it('check in the omen if the ev has been seen', function(){
            var ivv = new IVV(13);
            var ivv2 = new IVV(0);
	    ivv2.increment();
	    ivv2.increment();
	    var c = {_e : ivv2._e , _c:ivv2._v[ivv2._e]};
            expect(ivv.isLower(c)).to.not.be.ok();
            ivv.incrementFrom(c);
            expect(ivv.isLower(c)).to.be.ok();
	});
    });
    
});
