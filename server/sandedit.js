var site = parseInt(process.argv[2]);

var httpPort = parseInt(process.argv[3]);
var localAddress = process.argv[4].split(':')[0];
var localPort = parseInt(process.argv[4].split(':')[1]);
var localMask = process.argv[5];

var remoteAddress = process.argv[6].split(':')[0];
var remotePort = parseInt(process.argv[6].split(':')[1]);

var replica = new (require("./replica.js"))(site,
					    localAddress, localPort, localMask,
					    remoteAddress, remotePort);
var httpServer = require("http").createServer(httpHandler)
var io = require('socket.io').listen(httpServer);
var fs = require('fs');

httpServer.listen(httpPort);

io.sockets.on( 'connection', function(socket){
    socket.on('INS', function(data){ // from browser -> node
	replica.emit('insert', data._e, data._i);
    });

    socket.on('DEL', function(data){ // from browser -> node
	replica.emit('remove', data);
    });
    
    replica.on('INS', function(e,i){ // from node -> browser
	socket.emit('insert',{_e:e, _i:i});
    });

    replica.on('DEL', function(i){ // from node -> browser
	socket.emit('delete',{_i:i});
    });

    socket.emit('init', {_array: replica.toString(),
			 _address: replica.options.address,
			 _port: replica.options.port
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
