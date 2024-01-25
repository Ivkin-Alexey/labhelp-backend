require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {processCallbackQuery} = require("./methods/callbackQueriesProcessing");
const {processCommand} = require("./methods/commands");

process.on('uncaughtException', err => console.log(err));

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async msg => await processCommand(bot, msg));
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx));

module.exports = {bot};

