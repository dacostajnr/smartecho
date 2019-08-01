//'use strict';

const { Webhook, ExpressJS, Lambda } = require('jovo-framework');
const { app } = require ('./app.js');
var myexpress = require("express");
// ------------------------------------------------------------------
// HOST CONFIGURATION
// ------------------------------------------------------------------

// ExpressJS (Jovo Webhook)
if (process.argv.indexOf('--webhook') > -1) {
    const port = process.env.JOVO_PORT || 3000;
    Webhook.jovoApp = app;

    Webhook.listen(port, () => {
        console.info(`Local server listening on port ${port}.`);
    });

    Webhook.post('/webhook', async (req, res) => {
        await app.handle(new ExpressJS(req, res));
    });
    Webhook.get('/webhook', async (req, res) => {
       res.send("hu");
    });


    //================================================================================================================
    //'use strict';
var sbusLib = require('sbus-gateway');
var utilities = require('./lib/utilities');
var modbusUtility = require('./lib/modbus_handler');
var http = require('http');
var AppConfig;
var timeStamp = new Date().getTime();
var createError = require('http-errors');
//var express = require('express');
var restApiListeners = require('./lib/server')
var path = require('path');
var SbusDevice = require('./lib/classes').SbusDevice;
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var cors = require('cors');
var timeoutController = modbusUtility.TimeoutController.bind(modbusUtility);
var updateDevice = modbusUtility.updateDevice.bind(modbusUtility);
var DeviceData = {G0: {}, G1: {}, G2: {}};
var updateDeviceData;
// sbusLib.GETMAC(1,21)
//*********************** */LOAD CONFIGURATION FROM CONFIG.JSON FILE
async function GetSystemConfig() {
  try {
    AppConfig = await utilities.ReadConfig();
    return true;
  } catch (err) {
    AppConfig = null;
    return false;
  }
}

async function launch() {
  //LOG STARTUP MESSAGE
  console.log('\x1b[33m%s\x1b[36m%s\x1b[33m%s\x1b[0m', '\nSbus Gateway', '\nCopyright (C) Process and Plant Automation Limited, 2018. All Rights Reserved\nPowered by: www.automationghana.com\nEmail: support@automationghana.com', `\n-------------------\nInitializing...`);

  await GetSystemConfig();

  if (AppConfig == null) {
    console.log('\x1b[31m%s\x1b[0m', '\nInvalid config file\n\n');
    setTimeout(() => {}, 4000);
    return;
  } else {
    console.log('\x1b[33m%s\x1b[0m', 'Configuration File Loaded Successfully');
  }

  for (let dev of AppConfig.modbusConfig.devices) {
    DeviceData['G' + utilities.deviceTypes.devTypes[dev.deviceType].grp]['D' + dev.subnetid + dev.deviceid] = new SbusDevice(dev.devicename, dev.subnetid, dev.deviceid, dev.deviceType);
  }

  updateDeviceData = setInterval(() => {
    let fields = Object.keys(DeviceData);
    for (let group of fields) {
      let fieldDevs = Object.keys(DeviceData[group]);
      for (let dev of fieldDevs) {
        DeviceData[group][dev].checkOnline();
      }
    }
  }, 2000);

  //INITIALIZE SBUS LIBRARY WITH SPECIFIED PARAMETERS
  sbusLib.Initialize(AppConfig, utilities.deviceTypes);
  //SETUP MODBUS SERVER AND TIMEOUT CONTROLLER
  modbusUtility.Initialize(AppConfig);

  setInterval(function() {
    timeStamp = new Date().getTime();
    timeoutController(timeStamp);
  }, 2000);
}

launch();






//*******************RELOAD CONFIG AFTER CONFIG CHANGE********************************/
async function reloadConfig() {
  await GetSystemConfig();

  if (AppConfig == null) {
    console.log('\x1b[31m%s\x1b[0m', '\nInvalid config file\n\n');
    setTimeout(() => {}, 4000);
    return false;
  } else {
    console.log('\x1b[33m%s\x1b[0m', 'Configuration File Loaded Successfully');
  }
  try {
    sbusLib.Update(AppConfig, utilities.deviceTypes);
    modbusUtility.Update(AppConfig);
    var DeviceData = {G0: {}, G1: {}, G2: {}};
    for (let dev of AppConfig.modbusConfig.devices) {
      DeviceData['G' + utilities.deviceTypes.devTypes[dev.deviceType].grp]['D' + dev.subnetid + dev.deviceid] = new SbusDevice(dev.devicename, dev.subnetid, dev.deviceid, dev.deviceType);
    }
    clearInterval(updateDeviceData);
    updateDeviceData = setInterval(() => {
      let fields = Object.keys(DeviceData);
      for (let group of fields) {
        let fieldDevs = Object.keys(DeviceData[group]);
        for (let dev of fieldDevs) {
          DeviceData[group][dev].checkOnline();
        }
      }
    }, 2000);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}











//******************************** HANDLE MESSAGES FROM SBUS ***********************/
sbusLib.Server().on('error', err => {
  console.log(`server error:\n${err.stack}`);
});

//GROUPS 0-RELAYS 1-4Z 2-SENSORS 3-AUDIO
sbusLib.Events().on('updatestatus', data => {
  try {
    DeviceData['G' + data.type]['D' + data.subnetID + data.deviceID]['updateStatus'](data.channelStatus);
  } catch (err) {
    // console.log(err)
  }
  updateDevice(data.subnetID, data.deviceID, data.totalChannels, data.channelStatus, timeStamp, data.type);
});




//********************************** REST API ******************************** */

//var port = '4321';

var indexRouter = require('./lib/config/routes/index');
var usersRouter = require('./lib/config/routes/users');
var sbusRouter = require('./lib/config/routes/sbus');

//var app = express();
//app.set('port', port);
//Webhook.use(cors({credentials: false}));
//Webhook.use(express.json());
//Webhook.use(express.urlencoded({extended: false}));
//Webhook.use(cookieParser());
// Webhook.use(
//   expressSession({
//     secret: 'thisIsMySbusSessionSecret',
//     saveUninitialized: false,
//     resave: false,
//     cookie: {maxAge: 600000},
//   })
// );



//####################################################################################################################
//const path = require("path");
const bodyParser = require("body-parser");
Webhook.set("view engine","ejs");
Webhook.use(bodyParser());


var models = require("./users/models"); 
var intents = require("./users/intents");
intents = intents.intents;

User = models.User;
RSIP = models.RSIP;
Relay = models.Relay;
RelayChannel = models.RelayChannel; 
Command = models.Command;

Webhook.get("/exec/:ip/:port",function(req,res){  
  var incoming_ip_address = req.params.ip;
  var incoming_port_number = req.params.port;
  var incoming_macaddress = "83:2:0:0:135:79"; 
  // get command row with this mac address 
  Command.findOne({where:{"macaddress":incoming_macaddress}}).then(function(command){ 
    //res.send(command);  
    // get the user row with this command's email
    User.findAll({where:{"username":command.email}}).then(function(user){
      //res.send(user);
      // get relays of this user
      user = user[0];
      var b=[];
      Relay.findAll({where:{"UserId":user.id},include:[{model:RelayChannel}]}).then(function(relays){                       
        //res.send(relays);
        var c = relays.forEach(function(x){
          // x is one relay 
          // one relay can have multiple channels 
          // find the channel which has this name 
          //console.log(x["RelayChannels"].length)
          if (x["RelayChannels"].length!=0){
            // console.log(x["RelayChannels"].length);
            //res.send("hi")
            x["RelayChannels"].forEach(function(y){
              //console.log(y["name"]);
              if (y["name"]==command.location){
                //b.push([y["name"],y["channel_number"],y["relayId"]])
                b.push({
                  "ip address":incoming_ip_address,
                  "port number":incoming_port_number,
                  "subnet id of relay":x["subnetId"],
                  "device id of relay":x["deviceId"],
                  "channel id of relay":y["channel_number"],
                  "name of channel":y["name"],
                  "level":100
                })
                console.log(b);

              }

            })
          }

        });
        // delete command with this mac address       
        Command.destroy({where:{
          "macaddress":incoming_macaddress,
          "id":command.id
        }}).then(function(command){          
          // command.forEach(function(x){
          //   sbusLib.LightingControl(subnetId, deviceId,channel, 0, 0,x["ip address"],x["port number"]);
          // })

          console.log(b);
          res.send(b);

        })
        

      })


    })
  }).catch(function(err){{res.send(err)}})

})



// get all users in the database
Webhook.get("/",function(req,res){

    User.findAll({include:[{model:RSIP}]}).then(function(users){
    if (users.length!=0){     
      res.render("index_clone",{"users":users})
    }
    else{
      //res.send("no users found");
      res.render("index",{"users":users})


    }
  })
});


// show page for creating a new user
Webhook.get("/admin/users/create",function(req,res){
  res.render("create_user_clone",{})
});

//Create a new user with RSIP details
Webhook.post("/admin/users/create",function(req,res){
  User.create({
      "username":req.body.username, 
      "password":req.body.password
  }).then(function(user){
    RSIP.create({
      "UserId":user.id,
      "macaddress":req.body.macaddress,
      "subnetId":req.body.subnetId,
      "deviceId":req.body.deviceId,

    }).then(function(){
      res.redirect("/admin/users/detail/"+user.id.toString());
    })
  })

});




// Get detail of a user
Webhook.get("/admin/users/detail/:id",function(req,res,id){
  User.findByPk(req.params.id,{include:[{model:RSIP}]}).then(function(user){
    res.render("user_detail_clone",{"user":user})
  });
});


// Get list of users to enable deletion of a user
Webhook.get("/admin/users/delete",function(req,res){
  User.findAll().then(function(users){res.render("delete_user",{"users":users});
  });
})



// delete the user
Webhook.post("/admin/users/delete",function(req,res){
  User.findByPk(req.body.id).then(function(user){
    User.destroy({where:{
      "id":user.id
    }}).then(function(user){res.redirect("/admin/users/delete");})
  })
});



// show a list of users.Click on one to see update form
Webhook.get("/admin/users/update",function(req,res){
  User.findAll().then(function(users){
    res.render("update_users",{"users":users});
  });
});

// show update form for selected user
Webhook.get("/admin/users/:id/update",function(req,res){
  User.findByPk(req.params.id,{include:[{model:RSIP}]}).then(function(user){
    res.render("update_user",{"user":user})
    //res.send(user)
  })
})



Webhook.post("/admin/users/update",function(req,res){
  User.findByPk(req.body.id,{include:[{model:RSIP}]}).then(function(user){
      user.username  =req.body.username;
      user.password  = req.body.password; 
      user.save()
      
       rsip = user.RSIP;
       rsip.macaddress = req.body.macaddress;
       rsip.subnetId = req.body.subnetId;
       rsip.deviceId = req.body.deviceId;
       rsip.save()
       res.redirect("/admin/users/detail/"+user.id.toString())
  })
})

Webhook.get("/admin/rsips",function(req,res){
  RSIP.findAll().then(function(rsips){
    res.render("rsip_list",{"rsips":rsips})
  });
});

Webhook.post("/admin/rsips/delete",function(req,res){
  RSIP.destroy({where:{
    "id":req.body.id
  }}).then(function(rsip){
    res.redirect("/admin/rsips")
  })
})

Webhook.get("/admin/commands",function(req,res){
  Command.findAll().then(function(commands){
    res.render("command_list_clone",{"commands":commands})
  })
});
// Webhook.post("/admin/command/create",function(req,res){
//  Command.create({
//    email:req.body.email,
//    macaddress:req.body.macaddress,
//    intent:req.body.intent,
//    location:req.body.location
//  }).then(function(command){
//    res.redirect("/admin/commands");
//  });
// })


Webhook.post("/admin/command/create",function(req,res){
  // get user with email
  User.findAll({include:[{model:RSIP}]}).then(function(users){
    //res.send(users)

    var user = users.filter(function(user){
      console.log(`checking ${user.username} with length ${user.username.length}`);
      console.log(`checking ${req.body.email}  with length ${req.body.email.length}`);
      console.log(user.username==req.body.email);
      return user.username==req.body.email;
    })
    console.log("***********************")
    console.log(user);
    console.log("***********************")
    var user = user[0];   
      Command.create({
      "email":user.username,
      "macaddress":user.RSIP.macaddress,
      "intent":req.body.intent,
      "location":req.body.location
    }).then(function(command){
      res.redirect("/admin/commands")
    })

  })  
})

Webhook.post("/admin/commands/delete",function(req,res){
  Command.destroy({where:{
    "id":req.body.id
  }}).then(function(command){
    res.redirect("/admin/commands")
  })
})

Webhook.get("/admin/user/:id/relays",function(req,res){ 
  Relay.findAll({where:{
    "UserId":req.params.id
  }}).then(function(relays){
    res.render("user_relays_clone",{"relays":relays,"UserId":req.params.id})
  })
})
Webhook.get("/admin/devices",function(req,res){
     res.render("devices",{});
})

Webhook.get("/admin/relays/user/:id",function(req,res,id){
  Relay.findAll({where:{
    "UserId":req.params.id
  }}).then(function(relays){
    res.render("user_relays_clone",{"relays":relays})
  })  
})


Webhook.get("/admin/relay/create/user/:id",function(req,res,id){
    User.findByPk(req.params.id).then(function(user){
      res.render("create_relay_clone",{"user":user})
    })
})  

Webhook.post("/admin/relay/create",function(req,res){
  User.findByPk(req.body.id).then(function(user){
    Relay.create({
      "UserId":parseInt(req.body.id),
      "no_channels":req.body.no_channels,
      "subnetId":req.body.subnetId,
      "deviceId":req.body.deviceId 
    }).then(function(relay){
      res.redirect("/admin/user/"+req.body.id.toString()+"/relays")
      //res.redirect("/admin/relays")
      //res.send(relay);
    })
  })
})

Webhook.post("/admin/relay/delete/",function(req,res){
  Relay.destroy({where:{
    "id":req.body.relay_id
  }}).then(function(relay){
    res.redirect("/admin/relays/user/"+req.body.UserId.toString());
  })
})

Webhook.get("/admin/relay/:id/update",function(req,res){
  // show update form for a specific relay 
  Relay.findByPk(req.params.id).then(function(relay){
    res.render("update_relay",{"relay":relay});
  })    
})

Webhook.get("/admin/relay/:id/channels",function(req,res,id){
  // show all the channels of a relay 
  RelayChannel.findAll({where:{
    "RelayId":req.params.id
  }}).then(function(channels){
    //res.send(channels)
    //channels.forEach(function(x){console.log(x.RelayId)})
    res.render("relay_channel_list_clone",{"channels":channels,"Rid":req.params.id})
  })
})


Webhook.get("/admin/relay/:id/channel/create",function(req,res){
  // SHOW  CREATE  channel PAGE for a specific relay
  Relay.findByPk(req.params.id).then(function(relay){
    res.render("create_relay_channel_clone",{"relay":relay})
  })

})

Webhook.post("/admin/relay/channel/create",function(req,res){
  RelayChannel.create({
    "RelayId":req.body.relay_id,
    "name":req.body.name,
    "channel_number":req.body.channel_number 
  }).then(function(channel){
    res.redirect("/admin/relay/"+req.body.relay_id+"/channels");
  })
})


Webhook.post("/admin/relay/channel/delete/",function(req,res){ 
  //Delete a relay channel 
  RelayChannel.destroy({where:{
    "id":req.body.relay_channel_id 
  }}).then(function(channel){
    res.redirect("/admin/relay/"+req.body.relay_id.toString()+"/channels")
  })

})

Webhook.get("/admin/relay/channel/update/:id",function(req,res){
  // show form for updating a relay channel 
  RelayChannel.findByPk(req.params.id).then(function(channel){
    //res.send(channel);
    res.render("update_relay_channel_clone",{"channel":channel})
  })
})


Webhook.post("/admin/relay/channel/update",function(req,res){
  RelayChannel.update({
    "name":req.body.name,
    "channel_number":req.body.channel_number
  },{where:{
    "id":req.body.id
  }}).then(function(user){
    res.redirect("/admin/relay/"+req.body.relay_id.toString()+"/channels")

  })
})

Webhook.get("/admin/command/send",function(req,res){
  // show for for sending a command
  res.render("create_command_clone",{})
})
Webhook.post("/admin/command/send",function(req,res){
  Command.create({
    "email":req.body.email,
    "macaddress":req.body.macaddress,
    "intent":req.body.intent,
    "location":req.body.location
  }).then(function(command){
    res.redirect("/admin/commands")
  });
})

Webhook.get("/testrelay",function(req,res){
  Relay.findAll().then(function(relays){
    res.render("testrelay",{"relays":relays})
  })
})

Webhook.get("/testchannel",function(req,res){
  RelayChannel.findAll().then(function(channels){
    //res.send(channels);
    res.render("testchannel",{"channels":channels})
  })
})

// app.listen(3000,function(){
// console.log("server running at port 3000...")
// });
Webhook.use(myexpress.static(path.join(__dirname,"/public")));

//####################################################################################################################

// Webhook.use('/data', indexRouter);
// Webhook.use('/users', usersRouter);
// Webhook.get('/sbus/status', (req, res) => {
//   res.status(200).json({success: true, data: DeviceData});
// });
// Webhook.get('/sbus/devices', (req, res) => {
//   res.status(200).json({success: true, data: DeviceData});
// });
// Webhook.use('/sbus', sbusRouter);
// Webhook.use(myexpress.static(__dirname + '/lib/config/view/configView'));
// Webhook.use('/static', myexpress.static('public'));
// Webhook.post('/reload/config', (req, res) => {
//   var reloaded = reloadConfig();
//   if (reloaded) {
//     res.status(200).json({success: true, data: ''});
//   } else {
//     res.status(200).json({success: false, data: ''});
//   }
// });

// Webhook.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, './lib/config/view/configView/index.html'));
// });
// Webhook.use(function(req, res, next) {
//   next(createError(404));
// });








// var server = http.createServer(app);
// server.on('error', restApiListeners.onError);
// server.on('listening', restApiListeners.onListening);

// server.listen('4321');


    //================================================================================================================


}

// AWS Lambda
exports.handler = async (event, context, callback) => {
    await app.handle(new Lambda(event, context, callback));
};

