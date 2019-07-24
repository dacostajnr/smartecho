var devTypes = {
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
}
class SbusDevice {
 
  constructor(name,subid, devid, type) {
    this.name = name;
    this.subid = subid;
    this.devid = devid;
    this.type = type;
    this.online = false;
    this.timeStamp = 0;
    this.noc = devTypes[this.type]['noc'];
    this.status = new Array(this.noc);
  }
  getStatus() {
      return this.status;
  }
  updateStatus(status){
    this.online = true;
    this.status = status;
    this.timeStamp = new Date().getTime();
    
  }
  checkOnline(){
    if(Math.abs(parseInt(this.timeStamp)-parseInt(new Date().getTime()))>20000){
      this.online = false;
      return false
    }else{
      this.online = true;
      return true;
    }
  }
}
module.exports.SbusDevice = SbusDevice;