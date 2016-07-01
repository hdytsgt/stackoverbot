'use strict';

/**
 * API Key & Token
 */
const SlackToken		= '<Your Bot Slack Token>';
const GoogleAPIKey		= '<Your Google API Key>';
const GoogleCXCode		= '<Your Google CX ID>';

/**
 * Define Required vars
 */
var botkit     = require( 'botkit' ),
	request    = require( 'request' ),
	cheerio    = require( 'cheerio' ),
	url        = require( 'url' );

/**
 * Build up Slack
 */
var controller = botkit.slackbot();
var bot        = controller.spawn({
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


/**
 * BOT Class
 */
var BOT = {

	buildUrl: function( keyword ) {

		var _query = {
			key : GoogleAPIKey,
			cx  : GoogleCXCode,
			q   : 'site:stackoverflow.com ' + keyword,
			num : 10,
		};

		var _url = url.format({
						protocol : 'https',
						hostname : 'www.googleapis.com',
						pathname : '/customsearch/v1',
						query    : _query
				   });

		return _url;
	},

	parseSnippet : function( bot, message, $, obj, answer ) {

		bot.reply( message, 'From : *' + obj.title + '*' );

		var _filter = ( answer.find( 'pre code' ).length ) ? 'pre code' : 'code';

		answer.find( _filter ).each( function() {
			bot.reply(
				message,
				'```'+ $( this ).text() +'```'
			)
		});

	},

	process : function( bot, message, keyword ) {

		var _url  = BOT.buildUrl( keyword );

		request( _url, function( error, response, body ) {

			if( error ) {

				throw new Error( 'Something wrong with our Google wrapper : ' + error );
			
			} else {

				var _content = JSON.parse( body );

				if( typeof _content.items !== 'undefined' ) {
					
					var _count   = _content.items.length;

					bot.reply(
						message,
						'I found few item'+ ( _count > 1 ? 's' : '' ) +' from your keyword sir! let me populate it for you...' 
					);

					_content.items.map( function( obj ) {

						if( obj.link ) {

							request( obj.link, function( error, response, body ) {
								
								if( !error && response.statusCode == 200 ) {

									var $ = cheerio.load( body );

									if( $( '.accepted-answer' ).length ) {
										
										BOT.parseSnippet( bot, message, $, obj, $( '.accepted-answer' ) );

									} else {

									}

								} else {
									throw new Error( 'Something wrong with our Stack Overflow wrapper : ' + error );
								}

							});
						}
					});
				
				} else {

					bot.startConversation( message, function( err, conversation ) {

						if( !err ) {

							conversation.ask( 
								'I couln\'t find any result for your keyword sir! Do you want to try another keyword?',
								[
									{
										pattern: bot.utterances.yes,
										callback: function( response, conversation ) {

											conversation.ask('Got it sir! What is your new keyword?', function( response, conversation ) {

												conversation.say( 'Yes sir! Hold on a sec....' );

												BOT.process( bot, message, response.text );

											}, { 'key' : 'keyword' });
											
											conversation.next();
										}
									},
									{
										pattern: bot.utterances.no,
										callback: function( response, conversation ) {
											conversation.next();
										}
									},
									{
										default: true,
										callback: function( response, conversation ) {

											conversation.say( 'The answer only `yes` or `no` sir...' );
											
											conversation.repeat();
											conversation.next();
										}
									}
								]
							);

							conversation.on( 'end', function( conversation ) {
								conversation.say( {
									message    : 'Ok sir! Ask me anytime!',
									icon_emoji : ':robot_face:'
								});
							});
						}
					});
				}
			}
		});
	}
};