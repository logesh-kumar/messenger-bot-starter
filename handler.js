'use strict';
const BootBot = require('./lib/BootBot');
const config = require('./config');
const onBoardingFlow = require('./bot/onBoardingFlow')

/**
 * Handle intial request from messenger
 * @param  {Object} event
 * @param  {Object} context
 * @param  {Object} callback
 * @param  {Object} bot - Bot object 
 */
function initiateBot(event, context, callback, bot) {
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters;
    if (queryParams['hub.mode'] === 'subscribe' && queryParams['hub.verify_token'] === bot.verifyToken) {
      console.log('Validation Succeded.')
      const response = {
        'body': parseInt(queryParams['hub.challenge']),
        'statusCode': 200
      };
      callback(null, response);
    } else {
      console.log('Failed validation. Make sure the validation tokens match.');
      callback({ message: "Failed validation. Make sure the validation tokens match" });
    }
  } else if (event.httpMethod === 'POST') {

    const data = JSON.parse(event.body);
    if (data.object !== 'page') {
      callback({ message: "Invalid request" });
    }

    // Iterate over each entry. There may be multiple if batched.
    data.entry.forEach((entry) => {
      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message && event.message.is_echo && !bot.broadcastEchoes) {
          return;
        }
        if (event.optin) {
          bot._handleEvent('authentication', event);
        } else if (event.message && event.message.text) {
          bot._handleMessageEvent(event);
          if (event.message.quick_reply) {
            bot._handleQuickReplyEvent(event);
          }
        } else if (event.message && event.message.attachments) {
          bot._handleAttachmentEvent(event);
        } else if (event.postback) {
          bot._handlePostbackEvent(event);
        } else if (event.delivery) {
          bot._handleEvent('delivery', event);
        } else if (event.read) {
          bot._handleEvent('read', event);
        } else if (event.account_linking) {
          bot._handleEvent('account_linking', event);
        } else if (event.referral) {
          bot._handleEvent('referral', event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    })
  }
}


/**
 * Lambda function which will be invoked from api getway url
 * @param  {Object} event
 * @param  {Object} context
 * @param  {Object} callback
 */
module.exports.webhook = (event, context, callback) => {

  const bot = new BootBot({
    accessToken: config.accessToken,
    verifyToken: config.verifyToken,
    appSecret: config.appSecret
  });
  //set get started button
  bot.setGetStartedButton('GET_STARTED');
  onBoardingFlow.init(bot)

  initiateBot(event, context, callback, bot)
  callback(null, {
    'body': 'ok',
    'statusCode': 200
  })
}

