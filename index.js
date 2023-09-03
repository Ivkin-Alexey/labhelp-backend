const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const googleSpreadsheetAPIServices = require('./google-spreadsheet');
const cors = require('cors');
const fs = require("fs");
const https = require("https");

const token = '5925873875:AAG2u_B5HEToInmYc6hIfPEdAo7-HPYT_DM';
const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app/';

const {doc} = googleSpreadsheetAPIServices;
const app = express();

const httpsServer = https.createServer({
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
}, app);

const PORT = 443;

httpsServer.listen(PORT, () => console.log('server started on PORT ' + PORT));


const bot = new TelegramBot(token, {polling: true});

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Вы - лbnvbnох. Пожалуйста заполните форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'profile/editeProfile'}}]
                ]
            }
        })
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
        loadDoc().then(() => doc.updateProperties({ title: queryId + Math.random()}));

        return res.status(200).json({queryId});
    } catch (e) {
        return res.status(500).json({})
    }
})

app.get('/web-data', async (req, res) => {
    return res.status(200).json('Привет');
});



const loadDoc = async () => {
    await doc.loadInfo();
    let sheet = doc.sheetsByIndex[0];
    console.log(sheet.title);
};
