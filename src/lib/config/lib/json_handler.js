var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('$P$P$A$L$G$H$S$B$U$S$G$W');
var config_name = '/config/config.sbus.json';
var eMode = true;
var siteName = 'config';
var readFxn;
var defaultConfig = {
  ipAddress: '127.0.0.1',
  destinationIPs: ['255.255.255.255'],
  TimeoutPeriod: 4000,
  poll_Interval: 2000,
  modbusConfig: {
    devices: [
      {
        devicename: "GF relay 1",
        subnetid: 1,
        deviceid: 100,
        mb_Addr: 13,
        noc: 12,
        deviceType: 'SB-RLY12c10A-DN',
        poll: true,
      },
    ],
    mb_Port: '7727',
    numRegisters: 4000,
  },
};

var defUser = {
  username: 'admin',
  password: '$2a$11$oCT.Vg8L6fB6TBXBcdtoaeHE5BXKDZL6RHVCtibw1D1OvshzNXDBC',
};

var dir = path.join(__dirname, '../../../config/');
// var dir = path.join(path.dirname(process.execPath), '/config/');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

var salt = '$2a$11$oCT.Vg8L6fB6TBXBcdtoae';

function getConfigPath(fileName, encrypt=false) {
  var extsn = encrypt ? '.sbus.txt' : '.sbus.json';
  return path.join(__dirname, '../../../config/' + fileName + extsn);
  // return path.join(path.dirname(process.execPath), '/config/' + fileName + extsn);
}

async function ReadSetup() {
  return new Promise(function(resolve, reject) {
    var setup_file_path = getConfigPath("setup",false);

    fs.readFile(setup_file_path, function(err, config_file) {
      if (err) {
        fs.writeFile(
          setup_file_path,
          JSON.stringify({project: 'config', encrypt: 0}),
          function(err) {
            if (err) {
              return resolve(false);
            } else {
              return resolve(true);
            }
          }
        );
        siteName = 'config';
        config_name = 'config';
        eMode = false;
        readFxn = ReadConfig;
        return resolve({project: 'config', encrypt: 0});
      }

      try {
        siteName = JSON.parse(config_file).project;
        config_name = JSON.parse(config_file).project;
        eMode = JSON.parse(config_file).encrypt == 1 ? true : false;
        if(eMode){readFxn=eReadConfig}else{readFxn=ReadConfig};
        return resolve({});
      } catch (e) {
        console.log(e);
        return resolve({});
      }
    });
  });
}

(async function() {
  await ReadSetup();
})();

async function ReadConfig() {
  return new Promise(function(resolve, reject) {
    var config_file_path = getConfigPath(config_name,false);

    fs.readFile(config_file_path, function(err, config_file) {
      if (err) {
        console.log(err)
        return resolve(defaultConfig);
      }

      try {

        config_json = JSON.parse(config_file);
        // console.log(config_json)
        return resolve(config_json);
      } catch (e) {
        return resolve(defaultConfig);
      }
    });
  });
}

async function eReadConfig() {
  return new Promise(function(resolve, reject) {
    var config_file_path = getConfigPath(config_name,true);

    fs.readFile(config_file_path, function(err, config_file) {
      if (err) {
        return resolve(defaultConfig);
      }

      try {
        var jsonstring = cryptr.decrypt(config_file);
        config_json = JSON.parse(jsonstring);
        return resolve(config_json);
      } catch (e) {
        return resolve(defaultConfig);
      }
    });
  });
}
async function getConfig() {
  var data = await readFxn();
  return data;
}
async function nesaveConfig(data) {
  var oldData = await ReadConfig();
  let SBconfig = data;
  SBconfig['password'] = oldData['password']
  ? oldData['password']
  : defUser.password;
  return new Promise(function(resolve, reject) {
    fs.writeFile(
      getConfigPath(SBconfig.sitename,false),
      
      JSON.stringify(SBconfig),
      function(err) {
        if (err) {
          console.log("save config error",err);
          return resolve(false);
        } else {
          console.log('saving to ' + "./config/"+SBconfig.sitename+".sbus.json");
          return resolve(true);
        }
      }
    );
  });
}

async function esaveConfig(data) {
  var oldData = await eReadConfig();
  let SBconfig = data;
  SBconfig['password'] = oldData['password']
    ? oldData['password']
    : defUser.password;
  return new Promise(function(resolve, reject) {
    fs.writeFile(
      getConfigPath(SBconfig.sitename,true),
      cryptr.encrypt(JSON.stringify(SBconfig)),
      function(err) {
        if (err) {
          return resolve(false);
        } else {
          console.log(
            'saving to ' + getConfigPath(SBconfig.sitename,true)
          );
          return resolve(true);
        }
      }
    );
  });
}

async function saveConfig(data) {
  var saveVal;
  if (eMode) {
    saveVal = await esaveConfig(data);
  } else {
    saveVal = await nesaveConfig(data);
  }
  return saveVal;
}

async function checkUser(usnm, passw) {
  var data = await eReadConfig();
  hash = bcrypt.hashSync(passw, salt);
  if (data['password']) {
    if (defUser.username == 'admin' && hash == data['password']) {
      return {success: true, user: 'admin', siteName};
    }
  } else if (defUser.username == usnm && defUser.password == hash) {
    return {success: true, user: 'admin', siteName};
  }
  return false;
}
async function changePw(oldpw, newpw) {
  if(eMode){var data = await eReadConfig();}else{var data = await ReadConfig();}
  hash = bcrypt.hashSync(oldpw, salt);
  if (data['password']) {
    if (data['password'] == hash) {
      data.password = bcrypt.hashSync(newpw, salt);
      if(eMode){var savedData = await esaveConfig(data);}else{var savedData = await saveConfig(data);}
      return {success: true, data: 'admin'};
    } else {
      return {success: false, data: 'wrong password'};
    }
  } else if (oldpw == 'admin') {
    data.password = bcrypt.hashSync(newpw, salt);
    if(eMode){var savedData = await esaveConfig(data);}else{var savedData = await saveConfig(data);}
    return {success: savedData, data: 'admin'};
  }
  return false;
}

exports.checkUser = checkUser;
exports.getConfig = getConfig;
exports.saveConfig = saveConfig;
exports.changePw = changePw;
