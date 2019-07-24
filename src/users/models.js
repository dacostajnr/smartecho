const Sequelize = require("sequelize");

var connection = new Sequelize("smartecho_db","root","password",{
	dialect:"sqlite",
	storage:"smartecho.db",
	logging:false
});

connection.sync()
const User = connection.define("User",{
	username:{
		type:Sequelize.STRING

	},
	password:{
		type:Sequelize.STRING
	}
}); 
const RSIP  = connection.define("RSIP",{
	macaddress:{
		type:Sequelize.STRING 
	},
	subnetId:{
		type:Sequelize.INTEGER
	},
	deviceId:{
		type:Sequelize.INTEGER	
	}
});

const Relay = connection.define("Relay",{
	no_channels:{
		type:Sequelize.INTEGER
	},
	subnetId:{
		type:Sequelize.INTEGER
	},
	deviceId:{
		type:Sequelize.INTEGER

	},
	UserId:{
		type:Sequelize.INTEGER		
	}

});
const RelayChannel = connection.define("RelayChannel",{
	name:{
		type:Sequelize.STRING
	},
	channel_number:{
		type:Sequelize.INTEGER
	},
	RelayId:{
		type:Sequelize.INTEGER	
	}
});

const Command = connection.define("Command",{
	email:{
		type:Sequelize.STRING
	},
	macaddress:{
		type:Sequelize.STRING
	},
	intent:{
		type:Sequelize.STRING
	}
	,location:{
		type:Sequelize.STRING	
	},

});


// Each user has a single RSIP
User.hasOne(RSIP, {onDelete: 'cascade',hooks: true,});
//A user can have multiple relays
User.hasMany(Relay,{onDelete: 'cascade',hooks: true});
//A relay can have multiple channels 
Relay.hasMany(RelayChannel,{onDelete: 'cascade',hooks: true,});

//A user can have multiple commands...not indicated


exports.User = User;
exports.RSIP = RSIP;
exports.Relay = Relay; 
exports.RelayChannel = RelayChannel;
exports.Command = Command; 
