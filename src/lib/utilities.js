var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('$P$P$A$L$G$H$S$B$U$S$G$W');
config_path = 'config';


function getConfigPath(fileName, encrypt) {
  var extsn = encrypt ? '.sbus.txt' : '.sbus.json';
  return path.join(__dirname, '../config/' + fileName + extsn);
  // return path.join(path.dirname(process.execPath), '/config/' + fileName + extsn);
}

async function ReadSetup() {
  return new Promise(function(resolve, reject) {
    var config_file_path = getConfigPath("setup",false);
    fs.readFile(config_file_path, function(err, config_file) {
      if (err) {
        return resolve({project: 'config', encrypt: 0});
      }
      try {
        return resolve(JSON.parse(config_file));
      } catch (e) {
        console.log(e);
        return resolve({});
      }
    });
  });
}


module.exports = {
  ReadConfig: async function() {
    var setup_file = await ReadSetup();
    if (setup_file.encrypt == 1) {
      config_file_path = getConfigPath(setup_file.project, true);
    } else {
      config_file_path = getConfigPath(setup_file.project, false);
    }
    try {
      return new Promise(function(resolve, reject) {
        fs.readFile(config_file_path, function(err, config_file) {
          if (err) {
            console.log(err);
            reject(err);
          }

          try {
            if (setup_file.encrypt == 1) {
              config_json = JSON.parse(cryptr.decrypt(config_file));
            } else {
              config_json = JSON.parse(config_file);
            }
            return resolve(config_json);
          } catch (e) {
            reject(e);
          }
        });
      });
    } catch (err) {
      console.log('couldnt readFile');
    }
  },

  ReadModbusConfigSync: function() {
    try {
      var config_file_path = getConfigPath("config", false);;
      let config_file = fs.readFileSync(config_file_path, 'utf8');
      return JSON.parse(config_file).modbusConfig.devices;
    } catch (e) {
      return null;
    }
  },

  deviceTypes: {
    groups: {
      '0': {name: 'Relay', modbus: true},
      '1': {name: '4Z', modbus: true},
      '2': {name: 'Sensor', modbus: true},
    },
    relayTypes: ['SB-RLY4c20A-DN', 'SB-RLY4c16A-DN', 'SB-RLY6c16A-DN', 'SB-RLY8c16A-DN', 'SB-RLY12c10A-DN', 'SB-RLY15c10A-DN'],

    sensorTypes: ['5IPIR', '9IN1'],

    devTypes: {
      relay: {overFlow: true, multiplier: 100, MaxIndex: 7, noc: 6, grp: '0'},
      '4Z': {overFlow: false, multiplier: 1, MaxIndex: 3, noc: 4, grp: '1'},
      '5IPIR': {overFlow: false, multiplier: 1, MaxIndex: 6, noc: 7, grp: '2'},
      '9IN1': {overFlow: false, multiplier: 1, MaxIndex: 6, noc: 7, grp: '2'},
      'SB-RLY4c20A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 4, grp: '0'},
      'SB-RLY4c16A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 4, grp: '0'},
      'SB-RLY6c16A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 6, grp: '0'},
      'SB-RLY8c16A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 8, grp: '0'},
      'SB-RLY12c10A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 12, grp: '0'},
      'SB-RLY15c10A-DN': {overFlow: false, multiplier: 100, MaxIndex: 7, noc: 15, grp: '0'},
      // 'SB-DIM2c6A-DN': { overFlow: false, multiplier: 100, MaxIndex: 7, noc: 2 },
      // 'SB-DIM4c3A-DN': { overFlow: false, multiplier: 100, MaxIndex: 7, noc: 4 },
      // 'SB-DIM6c2A-DN': { overFlow: false, multiplier: 100, MaxIndex: 7, noc: 6 },
      // 'SB-DIM8c1A-DN': { overFlow: false, multiplier: 100, MaxIndex: 7, noc: 8 }
      // 'SB-ZMIX23-DN': { overFlow: false, multiplier: 100, MaxIndex: 7,noc:6 },
      // 'SB-MIX24-DN': { overFlow: false, multiplier: 100, MaxIndex: 7,noc:6 },
      // 'SB-2R-UN': { overFlow: false, multiplier: 100, MaxIndex: 7,noc:6 },
      // 'SB-3R-DN': { overFlow: false, multiplier: 100, MaxIndex: 7,noc:6 },
      // 'SB-6B0-10V-DN': { overFlow: false, multiplier: 100, MaxIndex: 7,noc:6 },
      //2R RELAYS YET TO BE ADDED
      //
    },

    sensorIndexConfig: {_9in1: [254, 255, 253, 252, 251, 250, 249], _IPIR: [250, 249, 255, 254, 253, 252, 251]},
  },
};
