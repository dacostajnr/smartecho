//'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------


//-------------------------------------------------------------------
var models = require("./users/models"); 
var intents = require("./users/intents");
intents = intents.intents;

User = models.User;
RSIP = models.RSIP;
Relay = models.Relay;
RelayChannel = models.RelayChannel; 
Command = models.Command;

var myfunctions = require("./myfunctions").myfunctions;

//-------------------------------------------------------------------

// ------------------------------------------------------------------
// account linking

const rp = require('request-promise');

//------------------------------------------------------------------

app.setHandler({
   async LAUNCH() {

        if (!this.$request.getAccessToken()) {
        this.$alexaSkill.showAccountLinkingCard();
        this.tell('Please link you Account');
    } else {
        let url = `https://api.amazon.com/user/profile?access_token=${this.$request.getAccessToken()}`;

        await rp(url).then((body) => {
            let data = JSON.parse(body);
            /*
            * Depending on your scope you have access to the following data:
            * data.user_id : "amzn1.account.XXXXYYYYZZZ"
            * data.email : "email@jovo.tech"
            * data.name : "Kaan Kilic"
            * data.postal_code : "12345"
            */
            console.log("##########################################################################");
            console.log(data)
            console.log("##########################################################################");            
             return this.toIntent('HelloWorldIntent');
        });
    }
       
    },

    async HelloWorldIntent() {
        if (!this.$request.getAccessToken()) {
            this.$alexaSkill.showAccountLinkingCard();
            this.tell('Please link you Account');
    } else {
        let url = `https://api.amazon.com/user/profile?access_token=${this.$request.getAccessToken()}`;
        await rp(url).then((body) => {
            let data = JSON.parse(body);
            this.ask("Smart echo here, how may I help you");             
        });
    }
    },

  async  MyNameIsIntent() {
        this.tell('Hey ' + this.$inputs.name.value + ', nice to meet you!');
    },
  async LightOnIntent(){ // parameter => location
         if (!this.$request.getAccessToken()) {
            this.$alexaSkill.showAccountLinkingCard();
            this.tell('Please link you Account');            
            } else {
                let url = `https://api.amazon.com/user/profile?access_token=${this.$request.getAccessToken()}`;
                await rp(url).then((body) => {
                let data = JSON.parse(body);


                let location = this.$inputs.location.value; // input variable
                let email = data.email;
                let intent = "LightOn";                

                // create command here
                this.ask(location+" lights turned on");
                console.log("about to turn on light at "+location);

                myfunctions.createCommand(email,intent,location);    
        });
    }

    },
    async LightOffIntent(){        
        if (!this.$request.getAccessToken()) {
            this.$alexaSkill.showAccountLinkingCard();
            this.tell('Please link you Account');
    } else {
        let url = `https://api.amazon.com/user/profile?access_token=${this.$request.getAccessToken()}`;
        await rp(url).then((body) => {
            let data = JSON.parse(body);
            
            let location = this.$inputs.location.value; // input variable        
            let email = data.email;
            let intent = "LightOff"; 

            // create command her
            this.ask(location+" lights turned off");
            console.log("about to turn off light "+location);
            myfunctions.createCommand(email,intent,location);

        });
    }    
        
    },

});

module.exports.app = app;




