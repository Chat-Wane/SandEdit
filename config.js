module.exports.dataFolder = "./data/";
module.exports.ipFile = "IPs";

module.exports.STARTTIME = (10000); // 10 s
module.exports.RUNNINGTIME = (1*60000); // 50 min
module.exports.STOPTIME = (1*60000); // 10 min
module.exports.PARTITIONTIME = 1;

module.exports.PEERS = 1; // 5 peers per cluster
module.exports.NEIGHBOURS = 0;
module.exports.OPERATIONS = 100000; // 5k insertions per cluster
module.exports.HOP = 4;
module.exports.MBSPCALL = 100; // membershipcall number
				    // before changin nwrk
module.exports.ANTIENTROPY = 10000; // 10s

module.exports.SUBNET = "127.0.0.1";
module.exports.MASK = "255.0.0.0";
module.exports.IPROOT = "127.0.0.";
module.exports.IPRANGE = 1;
module.exports.IPSTART = 1;
module.exports.PORT= 1400;

module.exports.CHECKPOINTS =[100, 500, 1000, 5000, 10000, 20000, 30000, 40000,
			     50000, 60000, 70000, 80000, 90000, 100000, 200000,
			     300000, 400000, 500000, 600000, 700000, 800000,
			     900000, 1000000];


console.log("Planification of "+
            (module.exports.OPERATIONS/module.exports.RUNNINGTIME*1000*
             module.exports.IPRANGE)+
            " op/s");
