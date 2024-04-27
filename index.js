import * as dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import {processCallbackQuery} from "./methods/callbackQueriesProcessing.js";
import {processCommand} from "./methods/commands.js";
import get from'./routes/get.js';
import post from'./routes/post.js';
import express from "express";
import cors from "cors" ;
import http from "http";
import https from "https";
import {PORT} from "./assets/constants/constants.js";

process.on('uncaughtException', err => console.log(err));

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async msg => await processCommand(bot, msg));
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx));

const app = express();
app.use(express.json());
app.use(cors());
get(app);
post(app);

const httpServer = http.createServer(app);
// const httpsServer = https.createServer({
//     key: fs.readFileSync('ssl/key.pem'),
//     cert: fs.readFileSync('ssl/cert.pem'),
// }, app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
})

// httpsServer.listen(HTTPS_PORT, () => {
//     console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
// })