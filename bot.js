'use strict';

/**
 * API Key & Token
 */
const SlackToken   = '<Your Bot Slack Token>';
const GoogleAPIKey = '<Your Google API Key>';
const GoogleCXCode = '<Your Google CX ID>';

/**
 * Define Required vars
 */
const botkit     = require( 'botkit' ),
      BOT        = require( './lib/bot_helper' )( { 
                        GoogleAPIKey: GoogleAPIKey,
                        GoogleCXCode: GoogleCXCode 
                   });

/**
 * Build up Slack
 */
const controller = botkit.slackbot();
const bot        = controller.spawn( { 
                    token: SlackToken
                 });

/**
 * Fireup Slack's Real Time Messaging
 */
bot.startRTM( function( err, bot, payload ) {
	if( err ){
		throw new Error( 'Could not connect to Slack' );
	}
});

/**
 * Bot Listening...
 */
controller.hears( [ 'find me (.*)' ], 'direct_message,direct_mention,mention', function( bot, message ) {
		
    bot.reply( message, 'Yes sir! Hold on a sec...' );

    BOT.process( bot, message, message.match[ 1 ] );

});