//-------------------------------------------------------------------
var models = require("./users/models"); 
var intents = require("./users/intents");
intents = intents.intents;

User = models.User;
RSIP = models.RSIP;
Relay = models.Relay;
RelayChannel = models.RelayChannel; 
Command = models.Command;
//-------------------------------------------------------------------

myfunctions = {
	createCommand:function(email,intent,location){
		  // get user with email
  		  User.findAll({include:[{model:RSIP}]}).then(function(users){
    	  //res.send(users)
    	var user = users.filter(function(user){
      	return user.username==email;
    })
    	console.log("***********************")
    	console.log(user);
    	console.log("***********************")
    	var user = user[0];   
      	Command.create({
      	"email":user.username,
      	"macaddress":user.RSIP.macaddress,
      	"intent":intent,
      	"location":location
    	}).then(function(command){
      	//res.redirect("/admin/commands")
      	console.log("command has been created");
    })})  
	},
}


exports.myfunctions = myfunctions;