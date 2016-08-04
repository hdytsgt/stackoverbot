# stackoverbot

A Node.js-based Slack bot for searching Stack Overflow snippet.

There are three keys required for this to run : [Slack Bot Token](https://my.slack.com/services/new/bot), [Google API Key](https://code.google.com/apis/console/), [Google CX ID](http://www.google.com/cse/manage/create).

![Screenshot](https://raw.githubusercontent.com/hdytsgt/stackoverbot/master/media/screenshot.png)

## Available Command

Currently there's only one command for this bot `find me <query>` where **query** could be anything you want to search. Example :

`find me laravel pluck`

or you can mention the **stackoverbot** on channel :

`@stackoverbot find me php sqrt`

`@stackoverbot find me css border-radius example`



## Installation

This should just works as any other Node.js application. 

1. Pull this repo
2. Go to **stackoverbot** folder and run `npm install`
3. Open `bot.js` and add your `Slack Bot Token`, `Google API Key` and `Google CX ID` into available vars. 
4. Run `node bot.js` or you can use any Node.js manager like [PM2](https://github.com/Unitech/PM2/) : `pm2 start bot.js`




## Related Project

[phpartisanbot](https://github.com/hdytsgt/phpartisanbot)


