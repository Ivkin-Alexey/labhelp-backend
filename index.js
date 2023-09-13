require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app/';

const app = express();

const PORT = 8000;

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Привет!')
    } else {
        await bot.sendMessage(chatId, 'Вы написали: ' + text)
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!' + JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
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
                message_text: `Следующие данные отправлены: ${formData}`
            }
        })
        return res.status(200).json({queryId});
    } catch (e) {
        return res.status(500).json({})
    }
})

app.get('/web-data', async (req, res) => {
    return res.status(200).json('Привет');
});

app.listen(PORT, () => console.log('server started on PORT ' + PORT))