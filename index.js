const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5925873875:AAG2u_B5HEToInmYc6hIfPEdAo7-HPYT_DM';
const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app/';
const app = express();

app.use(express.json())
app.use(cors())

const bot = new TelegramApi(token, {polling: true});

const startMessage = 'Вы - новый пользователь лаборатории. Для продолжения Вам нужно зарегистрироваться'
;

bot.on('message', msg => { // it starts if user send message to bot
    const {text}= msg;
    const chatId = msg.chat.id;
    const {first_name, last_name} = msg.chat;

    if(text === '/start') {
        bot.sendMessage(chatId, `Приветствую ${first_name} ${last_name}! ${msg}`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Зарегистрироваться', web_app: {url: webAppUrl + 'profile/editeProfile'}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
           bot.sendMessage(chatId, data)
        } catch (e) {
            console.log(e);
        }
    }
})

app.post('/web-data', async (req, res) => {
    const {queryID, data} = req.body;
    try {
       await bot.answerWebAppQuery(queryID, {
           type: 'article',
           id: queryID,
           title: 'данные пользователя',
           input_message_content: {
               message_text: `Ваши данные отправлены ${data}`
           }
       })
        await bot.sendMessage(data)
        return res.status(200).json({})
    } catch (e) {
        await bot.answerWebAppQuery(queryID, {
            type: 'article',
            id: queryID,
            title: 'данные пользователя',
            input_message_content: {
                message_text: 'Не удалось отправить Ваши данные'
            }
        })
        return res.status(500).json({})
    }
})
//jhkhk
const PORT = 8080;
app.listen(PORT, () => console.log('server starting on PORT ' + PORT))
