'use strict';

module.exports = ( config ) => {

    const request    = require( 'request' ),
          cheerio    = require( 'cheerio' ),
          url        = require( 'url' );

    if( !config ) {
    	config = {
    		GoogleAPIKey : '',
    		GoogleCXCode : ''
    	}
    }

	let BOT = {

		/**
		 * Build Google Search URL
		 * 
		 * @param  keyword
		 * @return string
		 */
		buildUrl: function( keyword ) {

			var _query = {
				key : config.GoogleAPIKey,
				cx  : config.GoogleCXCode,
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

		/**
		 * Display snippet from Stack Overflow
		 * 
		 * @param  bot
		 * @param  message
		 * @param  $ 
		 * @param  obj
		 * @param  answer
		 * 
		 * @return void
		 */
		parseSnippet : function( bot, message, $, obj, answer ) {

			bot.reply( message, 'From : *' + obj.title + '*' );

			let _filter  = ( answer.find( 'pre code' ).length ) ? 'pre code' : 'code',
			    _answers = [];

			answer.find( _filter ).each( function() {
				_answers.push( $( this ).text() );
			});

			bot.reply(
					message,
					'```'+ _answers.join( '\n' ) +'```'
				);
		},

		/**
		 * Run Bot
		 * 
		 * @param  bot
		 * @param  message
		 * @param  keyword
		 * 
		 * @return void
		 */
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

	return BOT;
};