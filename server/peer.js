var smoke = require('smokesignal');
var SSeq = require('./sseq.js');


/* \var s the remote part of events
 * \param argv[2] the unique id of the site
 */
var s = new SSeq(parseInt(process.argv[2]));

/*!
 * \var node
 * \brief the local event of the peer to broadcast
 * \param argv[3] the port of this peer
 * \param argv[4] the port of the seed
 */
var node = smoke.createNode({
  port: parseInt(process.argv[3])
, address: smoke.localIp('127.0.0.1/255.0.0.0')
, seeds: [{port: parseInt(process.argv[4]), address:'127.0.0.1'}]
})

console.log('Port', node.options.port)
console.log('IP', node.options.address)
console.log('ID', node.id)

console.log('Connecting...');

node.on('connect', function() {
    console.log('Connection established.');    
});

node.on('disconnect', function() {
  console.log('Disconnected.');
});

node.on('error', function(e) {throw e});

node.on('insert', function(e, i){
    var ei = s._array.insert(e,i);
    s._vector.increment();
    s.push(JSON.stringify({_type:'INS',
			   _causal:{_e: s._vector._e, _c: s._vector._v[s._e]},
			   _data:ei}));
});

node.on('remove', function(i){
    var id = s._array.remove(i);
    var couple = {_e: id._s[id._s.length - 1], _c: id._c[id._c.length - 1] };
    s.push(JSON.stringify({_type:'REM',
			   _causal: couple,
			   _data: id}));
});

s.pipe(node.broadcast).pipe(s);

node.start();
