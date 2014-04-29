module.exports.dataFolder = "./data/";

module.exports.STARTTIME = (10000); // 10 s
module.exports.RUNNINGTIME = (50*60000); // 50 min
module.exports.STOPTIME = (10*60000); // 10 min
module.exports.PARTITIONTIME = 50;

module.exports.PEERS = 10; // 5 peers per cluster
module.exports.NEIGHBOURS = 3;
module.exports.OPERATIONS = 500000; // 5k insertions per cluster
module.exports.HOP = 3;
module.exports.MBSPCALL = 10; // membershipcall number
						    // before changin nwrk
module.exports.ANTIENTROPY = 10000; // 10s

module.exports.SUBNET = "127.0.0.1";
module.exports.MASK = "255.0.0.0";
module.exports.IPROOT = "127.0.0.";
module.exports.IPRANGE = 1;
module.exports.IPSTART = 1;
module.exports.PORT= 1400;


console.log("Planification of "+
            (module.exports.OPERATIONS/module.exports.RUNNINGTIME*1000*
             module.exports.IPRANGE)+
            " op/s");
