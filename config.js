module.exports.dataFolder = "./public/bn";
module.exports.ipFile = "./sandedit/IPs";

module.exports.STARTTIME = (1*60000); // 1 min
module.exports.RUNNINGTIME = (50*60000); // 5 min
module.exports.STOPTIME = (5*60000); // 1 min
module.exports.PARTITIONTIME = 50;

module.exports.PEERS = 2; // 5 peers per cluster
module.exports.NEIGHBOURS = 9;
module.exports.OPERATIONS = 10000; // 5k insertions per cluster
module.exports.HOP = 4;
module.exports.MBSPCALL = 100; // membershipcall number
				    // before changin nwrk
module.exports.ANTIENTROPY = 8000; // 8s

module.exports.SUBNET = "172.16.112.99";
module.exports.MASK = "20";
module.exports.PORT= 1400;

module.exports.CHECKPOINTS =[100, 500, 1000, 5000, 10000, 20000, 30000, 40000,
			     50000, 60000, 70000, 80000, 90000, 100000, 200000,
			     300000, 400000, 500000, 600000, 700000, 800000,
			     900000, 1000000];
