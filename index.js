require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const webAppUrl = 'https://frolicking-kleicha-94863e.netlify.app/';
const localisations = require("./localisations.js");
const {keyboards, commands, stickers, researches, researchTopics, smiles} = require("./assets/db");

process.on('uncaughtException', function (err) {
    console.log(err);
});

const app = express();

const PORT = 8000;

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

app.use(express.json());
app.use(cors());

bot.setMyCommands(commands);

async function sendResearches(chatId) {
    try {
        await bot.sendMessage(chatId, localisations.selectResearches, {
            reply_markup: {
                keyboard: keyboards.researches,
                resize_keyboard: true
            }
        })
    } catch (e) {
        console.log(e);
    }
}

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const research = researches.find(el => el.name === text.replace(smiles.researches, ''));

    if (text === '/start') {
        try {
            await bot.sendSticker(chatId, stickers.hello);
            await bot.sendMessage(chatId, localisations.startMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Да', callback_data: "Yes"}, {text: 'Нет', callback_data: "No"}],
                    ]
                }
            })
        } catch (e) {
            console.log(e);
        }
    } else if (text === '/researches') {
        await sendResearches(chatId);
    } else if (text === '❌  Закрыть меню') {
        await bot.sendMessage(chatId, 'Меню закрыто', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    } else if (research) {

        const {id, degree, advisor} = research;

        const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`);
        await bot.sendPhoto(msg.chat.id, imageStream);
        await bot.sendMessage(msg.chat.id, "Руководитель направления: " + degree + " " + advisor);
        await bot.sendMessage(msg.chat.id, "Описание направления. Описание направления. Описание направления. Описание направления.", {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Присоединиться', web_app: {url: webAppUrl}}],
                ]
            }
        })
    } else {
        await bot.sendSticker(chatId, stickers.unknown);
        await bot.sendMessage(chatId, localisations.iDontUnderstand);
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!' + JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
    }
});

bot.on('callback_query', async ctx => {
    const chatId = ctx.message.chat.id;
    try {
        switch (ctx.data) {
            case "Yes":
                await bot.sendSticker(chatId, stickers.agree);
                await sendResearches(chatId);
                break;

            case "No":
                await bot.sendSticker(chatId, stickers.disagree);
                break;
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, formData} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Следующие данные отправлены: ${formData}`,
            }
        })
        return res.status(200).json({queryId});
    } catch (e) {
        return res.status(500).json({});
    }
});

app.get('/web-data', async (req, res) => {
    return res.status(200).json('Привет');
});

app.listen(PORT, () => console.log('server started on PORT ' + PORT));