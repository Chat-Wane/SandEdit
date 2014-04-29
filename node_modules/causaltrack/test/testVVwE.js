var expect = require('expect.js');
var Mocha = require('mocha');

var VVwE = require('../lib/versionvectorwithexcept.js');

describe('versionvectorwithexcept.js', function() {

    describe('vvwe', function(){
	it('init the entries to zero', function(){
	    var vvwe = new VVwE(13);
	    expect(vvwe._v[vvwe._e]).to.be.eql(0);
	    expect(vvwe._x[vvwe._e]).to.have.length(0);
	});
    });
    
    describe('increment', function(){
	it('increment the entry', function(){
	    var vvwe = new VVwE(13);
	    vvwe.increment();
	    expect(vvwe._v[vvwe._e]).to.be.eql(1);
	});

	it('no exception created', function(){
	    var vvwe = new VVwE(13);
	    vvwe.increment();
	    vvwe.increment();
	    expect(vvwe._x[vvwe._e]).to.have.length(0);
	});
    });

    describe('incrementfrom', function(){
	it('increment the entry from another vv', function(){
	    var vvwe = new VVwE(13);
	    var rvvwe = new VVwE(4);
	    rvvwe.increment();
	    vvwe.incrementFrom({_e: rvvwe._e, _c:rvvwe._v[rvvwe._e] });
	    expect(rvvwe._v[rvvwe._e]).to.be.eql(1);
	    expect(vvwe._v[rvvwe._e]).to.be.eql(rvvwe._v[rvvwe._e]);
	});

	it('increment from anywhere does not affect my entry', function(){
	    var vvwe = new VVwE(13);
	    var rvvwe = new VVwE(4);
	    rvvwe.increment();
	    vvwe.incrementFrom({_e: rvvwe._e, _c:rvvwe._v[rvvwe._e] });
	    expect(vvwe._v[vvwe._e]).to.be.eql(0);
	});

	it('a message is lost, exception is made', function(){
	    var vvwe = new VVwE(13);
	    var rvvwe = new VVwE(4);
	    rvvwe.increment();
	    rvvwe.increment();
	    expect(rvvwe._v[rvvwe._e]).to.be.eql(2);
	    vvwe.incrementFrom({_e: rvvwe._e, _c:rvvwe._v[rvvwe._e] });
	    expect(vvwe._x[rvvwe._e]).to.have.length(1);
	    expect(vvwe._x[rvvwe._e].indexOf(1)).to.be.above(-1);
	});
    });
    
    describe('isReady', function(){
	it('check if an operation depending on another is ready', function(){
	    var vvwe = new VVwE(13);
	    vvwe.increment();
	    var target = {_e:vvwe._e, _c:vvwe._v[vvwe._e]};
	    expect(vvwe.isRdy(target)).to.be.ok();
	    var target2 = {_e:vvwe._e, _c:(vvwe._v[vvwe._e]+1)};
	    expect(vvwe.isRdy(target2)).to.not.be.ok();
	});
	
	it('check if an operation independant of any other is rdy',function(){
	    var vvwe = new VVwE(13);
	    var c = null;
	    expect(vvwe.isRdy(c)).to.be.ok();
	});

	it('check in the omen vector for target operation', function(){
	    var vvwe = new VVwE(13);
	    var vvwe2 = new VVwE(0);
	    vvwe2.increment();
	    vvwe2.increment();
	    var c = {_e: vvwe2._e, _c: vvwe2._v[vvwe2._e]};
	    vvwe.incrementFrom(c);
	    // another operation arrive depending on operation identifier by c;
	    expect(vvwe.isRdy(c)).to.be.ok();
	});
    });
    
    describe('isLower', function(){
	it('check if the ev has been seen before or not', function(){
            var vvwe = new VVwE(13);
            var vvwe2 = new VVwE(0);
	    vvwe2.increment();
	    var c = {_e : vvwe2._e , _c:vvwe2._v[vvwe2._e]};
            expect(vvwe.isLower(c)).to.not.be.ok();
            vvwe.incrementFrom(c);
            expect(vvwe.isLower(c)).to.be.ok();
        });

	it('check in the omen if the ev has been seen', function(){
            var vvwe = new VVwE(13);
            var vvwe2 = new VVwE(0);
	    vvwe2.increment();
	    vvwe2.increment();
	    var c = {_e : vvwe2._e , _c:vvwe2._v[vvwe2._e]};
            expect(vvwe.isLower(c)).to.not.be.ok();
            vvwe.incrementFrom(c);
            expect(vvwe.isLower(c)).to.be.ok();
	});
    });
    
});
