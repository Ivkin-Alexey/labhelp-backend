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

const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");
const fs = require("fs");
const {PORT, HTTPS_PORT} = require("./assets/constants/constants");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
}, app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
})

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
})

module.exports = {app};