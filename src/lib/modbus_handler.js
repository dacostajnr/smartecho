/*jshint esversion: 6 */
'use strict';
//Object.defineProperty(exports, "__esModule", { value: true });
var stampit = require('stampit');
const modbus = require('jsmodbus');
var utilities = require('./utilities');

module.exports = {
  logEnable: false,
  deviceList: [],
  timeStampArray: [],
  modbusServer: null,
  TimeoutPeriod: 12000,
  devTypes: utilities.deviceTypes.devTypes,
  devGroups: utilities.deviceTypes.groups,

  Initialize: function(AppConfig) {
    try {
      this.deviceList = AppConfig.modbusConfig.devices
        ? AppConfig.modbusConfig.devices
        : [];
      this.timeStampArray = this.deviceList.map(e => {
        return 0;
      });
      this.logEnable = AppConfig.logEnable ? AppConfig.logEnable : false;
      //DEFAULT TIMEOUT IS 12 SECONDS
      this.TimeoutPeriod = AppConfig.TimeoutPeriod
        ? AppConfig.TimeoutPeriod
        : 12000;
      //SETUP MODBUS SERVER
      this.modbusServer = modbus.server.tcp.complete({
        port: AppConfig.modbusConfig.mb_Port,
        coils: new Buffer(AppConfig.modbusConfig.numRegisters?AppConfig.modbusConfig.numRegisters:4000),
        holding: new Buffer(AppConfig.modbusConfig.numRegisters?AppConfig.modbusConfig.numRegisters:4000),
      });
      
      //MODBUS SERVER STARTED
      console.log(
        '\x1b[33m%s\x1b[0m',
        `Modbus Server Listening on port: ${
          AppConfig.modbusConfig.mb_Port
        }\n-----------------------\n`
      );
    } catch (err) {
      console.log('invalid modbus configuration');
    }
  },
  Update:function(AppConfig){
    try {
      this.deviceList = AppConfig.modbusConfig.devices
        ? AppConfig.modbusConfig.devices
        : [];
      this.timeStampArray = this.deviceList.map(e => {
        return 0;
      });
      this.logEnable = AppConfig.logEnable ? AppConfig.logEnable : false;
      //DEFAULT TIMEOUT IS 12 SECONDS
      this.TimeoutPeriod = AppConfig.TimeoutPeriod
        ? AppConfig.TimeoutPeriod
        : 12000;
      //SETUP MODBUS SERVER
     
      
      
    } catch (err) {
      console.log('invalid modbus configuration',err);
    }
  },
  stopServer:function(){
    this.modbusServer = null;
  },
  updateDevice: function(
    subnetID,
    deviceID,
    totalChannels,
    channelStatus,
    currentTimeStamp,
    type
  ) {
    try {
      if (this.logEnable) {
        console.log(
          `\n${
            this.devGroups[type].name
          } Status Event: subnetid = ${subnetID}, deviceid = ${deviceID}, No. of channels = ${totalChannels}, Channel Status = ${channelStatus}`
        );
      }
      this.mbupdate(subnetID, deviceID, channelStatus, currentTimeStamp, type, totalChannels);
    } catch (err) {
      console.log('\x1b[33m%s\x1b[0m', `\n\nCouldn't update device\n`, err);
    }
  },

  mbupdate: function(
    subnetID,
    deviceID,
    channelStatus,
    currentTimeStamp,
    type,
    totalChannels
  ) {
    try {
      let index = 0;

      for (let dev of this.deviceList) {
        //LOOK FOR SPECIFIC DEVICE IN CONFIG LIST
        if (
          dev.deviceid == deviceID &&
          dev.subnetid == subnetID &&
          this.devTypes[dev.deviceType] != null
        ) {
          if (this.devTypes[dev.deviceType]['grp'] == type) {
            let writeAddress = dev.mb_Addr * 2; //EACH MODBUS REGISTER IS 16BIT. THE ADDRESS REFERENCES BYTES
            this.writeToModbus(
              writeAddress,
              channelStatus,
              this.devTypes[dev.deviceType].noc,
              totalChannels
            );
            this.UpdateTimeStamp(index, currentTimeStamp); //UPDATE ONLINE STATUS
          } else {
            console.log('wrong device type');
          }

          break;
        }
        index++;
      }
    } catch (err) {
      console.log('error executing mbUpdate', err);
    }
  },

  writeToModbus: function(writeAddress, channelStatus, noc,totalChannels) {
    try {
      for (let i = 0; i < noc; i++) {
        if(i==totalChannels){break;};
        this.modbusServer
          .getHolding()
          .writeUInt16BE(channelStatus[i], writeAddress + 2 * i); // REFERENCING LOWER BYTE OF WORD
      }
    } catch (err) {
      console.log(`couldn't update modbus registers\n`, err);
    }
  },

  UpdateTimeStamp: function(index, currentTimeStamp) {
    this.timeStampArray[index] = currentTimeStamp;
  },

  TimeoutController: function(currentTimeStamp) {
    try {
      let writeAddress;
      for (let index = 0; index < this.timeStampArray.length; index++) {
        if (this.devTypes[this.deviceList[index].deviceType] != null) {
          writeAddress =
            this.deviceList[index].mb_Addr * 2 +
            this.devTypes[this.deviceList[index].deviceType]['noc'] * 2;

          if (
            Math.abs(this.timeStampArray[index] - currentTimeStamp) >
            this.TimeoutPeriod
          ) {
            // console.log("offline",this.deviceList[index])
            this.modbusServer.getHolding().writeUInt16BE(0, writeAddress);
          } else if (
            Math.abs(this.timeStampArray[index] - currentTimeStamp) <=
            this.TimeoutPeriod
          ) {
            // console.log("now online",this.deviceList[index])
            this.modbusServer.getHolding().writeUInt16BE(1, writeAddress);
          }
        }
      }
    } catch (err) {
      console.log('couldnt update online register', err);
    }
  },

  pollupdate: function(deviceList, type, subnetID, deviceID, mbstate) {
    try {
      let writeAddress;
      let readytowrite;
      let deviceList_choice;
      for (let dev of this.deviceList) {
        if (dev.deviceid == deviceID && dev.subnetid == subnetID) {
          //search for device ID in deviceList variable

          writeAddress = dev.mb_Addr * 2;
          deviceList_choice = dev;
          this.writeToModbus(type, deviceList_choice, writeAddresss, mbstate);

          break;
        }
      }
    } catch (err) {
      console.log('error executing poll-Update', err);
    }
  },
};
