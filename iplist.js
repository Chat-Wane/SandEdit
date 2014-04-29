var input = process.argv[2];

var fs = require('fs');
var dns = require('dns');

var ips = [];

function Read(){
    fs.readFile(input, function (err, data) {
        if (err) throw err;
        var lines = data.toString().split("\n");
        for (var i = 0; i< lines.length; ++i){
	    dns.lookup(lines[i], function(err,address,family){
		if (address !== null){
		    console.log(address);
		};
	    });
	};
    });
};

Read();



