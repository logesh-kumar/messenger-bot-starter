"use strict";
var swearjar = require('swearjar');

const init = bot => {
    bot.on('message', (payload, chat) => {
        const nlp = payload.message.nlp && payload.message.nlp.entities;
        console.log(JSON.stringify(nlp))
        chat.getUserProfile().then((user) => {
            if (swearjar.profane(payload.message.text))
                chat.say(`I never expected this from you ${user.first_name} :(`)
            else if (nlp.greetings && nlp.greetings[0]['confidence'] > 0.9)
                chat.say(`Hello ${user.first_name} :)`)
            else if (nlp.thanks && nlp.thanks[0]['confidence'] > 0.9)
                chat.say(`You are welcome ${user.first_name} :)`)
            else if (nlp.bye && nlp.bye[0]['confidence'] > 0.9)
                chat.say(`Bye ${user.first_name}. See you later :)`)
            else
                chat.say('hi')
        })
    });

    bot.on('postback:GET_STARTED', (payload, chat) => {
        console.log('The Get Started button was clicked!');
        chat.getUserProfile().then((user) => {
            chat.say(`Hello, ${user.first_name}! I am Orthobot. You can ask me anything related to orthopedics.`);
        });
    });

    bot.on('attachment', (payload, chat) => {
        console.log('An attachment was received!');
    });
}


module.exports = {
    init: init
}

