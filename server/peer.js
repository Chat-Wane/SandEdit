var smoke = require('smokesignal');
var SSeq = require('./sseq.js');

var s = new SSeq(42);
var node = smoke.createNode({
  port: parseInt(process.argv[2])
, address: smoke.localIp('127.0.0.1/255.0.0.0')
, seeds: [{port: 6666, address:'127.0.0.1'}]
})

console.log('Port', node.options.port)
console.log('IP', node.options.address)
console.log('ID', node.id)

console.log('Connecting...');

node.on('connect', function() {
    console.log('Connection established.');    
    this.emit('insert', 'a', 0);
});

node.on('disconnect', function() {
  console.log('Disconnected.');
});

node.on('error', function(e) {throw e});

node.on('insert', function(e, i){
    var ei = s._array.insert(e,i);
    s.push(JSON.stringify({_type:'INS', _data:ei}));
});

node.on('delete', function(i){
    var id = s._array.remove(i);
    s.push(JSON.stringify({_type:'REM', _data:id}));
};

s.pipe(node.broadcast).pipe(s);

node.start();
