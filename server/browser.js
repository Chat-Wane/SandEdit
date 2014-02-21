var httpServer = require("http").createServer(httpHandler)

var id = parseInt(process.argv[2]);
var httpPort = parseInt(process.argv[3]);
var remotePort = parseInt(process.argv[4]) || (httpPort +1);
var localPort = parseInt(process.argv[5]) || (httpPort + 1);


var fs = require('fs');

var node = new (require("./node.js"))(id, localPort, remotePort);

var io = require('socket.io').listen(httpServer);
httpServer.listen(httpPort);

io.sockets.on( 'connection', function(socket){
    socket.on('INS', function(data){
	node._node.emit('insert', data._e, data._i);
    });

    socket.on('DEL', function(data){
	node._node.emit('remove', data);
    });
    
    node._node.on('INS', function(e,i){
	socket.emit('insert',{_e:e, _i:i});
    });
    
    node._node.on('DEL', function(i){
	socket.emit('delete',{_i:i});
    });
});

function httpHandler(req, res) {
    fs.readFile("../client/main.html", function (err, data) {
        if (err){
            res.writeHead(500);
            return res.end("No main found");
        };
        res.writeHead(200);
        res.end(data);
    });    
};
