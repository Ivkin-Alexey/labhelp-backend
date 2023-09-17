require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
// const fs = require("fs");
// const webAppUrl = 'https://frolicking-kleicha-94863e.netlify.app/';
// const localisations = require("./localisations.js");
const {userList} = require("./assets/db");
const {stickers, researches, smiles, researchTopics} = require("./assets/constants");
const BotAnswers = require("./methods/botAnswers");
const BotQuestions = require("./methods/botQuestions");

process.on('uncaughtException', function (err) {
    console.log(err);
});

const app = express();
const PORT = 8000;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});
app.use(express.json());
app.use(cors());

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const {first_name, last_name} = msg.chat;
    const researchTopic = text.replace(smiles.researches, '');
    const researchBtnText = researchTopics.includes(researchTopic) ? text : undefined;
    const studyGroup = text.includes("группа") ? text : undefined;
    const phone = validatePhoneNumber(text) ? text : undefined;

    function validatePhoneNumber(input_str) {
        const re = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm;
        return re.test(input_str);
    }

    async function updateUserData(chatId, field, value) {
        userList[chatId][field] = value;
    }

        try {
            switch (text) {
                case "/start":
                    await BotAnswers.sendStartMessage(bot, chatId, first_name, last_name);
                    await BotQuestions.askConfirmNewUser(bot, first_name, last_name)
                    break;
                case "/researches":
                    await BotAnswers.sendResearches(bot, chatId);
                    break;
                case "/get_chat_id":
                    await bot.sendMessage(chatId, 'Чат ID: ' + chatId);
                    break;
                case researchBtnText:
                    await BotAnswers.sendResearch(bot, chatId, researchTopic);
                    break;
                case studyGroup:
                    await BotQuestions.askPhoneNumber(bot, chatId);
                    await updateUserData(chatId, "studyGroup", studyGroup);
                    break;
                case phone:
                    await bot.sendMessage(chatId, "Ваш номер " + phone);
                    break;
                default:
                    await BotAnswers.sendConfusedMessage(bot, chatId);
            }
            await bot.sendMessage(chatId, JSON.stringify(userList[chatId]))
        } catch (e) {
            console.log(e);
        }

    // } else if (text === '❌  Закрыть меню') {
    //     await bot.sendMessage(chatId, 'Меню закрыто', {
    //         reply_markup: {
    //             remove_keyboard: true
    //         }
    //     })
    // }

    // if (msg?.web_app_data?.data) {
    //     try {
    //         const data = JSON.parse(msg?.web_app_data?.data)
    //         await bot.sendMessage(chatId, 'Спасибо за обратную связь!' + JSON.stringify(data));
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
});

bot.on('callback_query', async ctx => {
    const chatId = ctx.message.chat.id;
    try {
        switch (ctx.data) {
            case "Yes":
                await bot.sendSticker(chatId, stickers.agree);
                await BotAnswers.sendResearches(bot, chatId);
                break;
            case "No":
                await bot.sendSticker(chatId, stickers.disagree);
                break;
            case "joinUs":
                await bot.sendSticker(chatId, stickers.ok);
                await BotQuestions.askUserPosition(bot, chatId);
                break;
            case "bachelor":
            case "master":
                await BotQuestions.askEducationalGroup(bot, chatId);
                break;
            case "adminConfirmUser":
                await BotQuestions.askEducationalGroup(bot, chatId);
                break;
        }
    } catch (error) {
        console.log(error);
    }
});

// app.post('/web-data', async (req, res) => {
//     const {queryId, formData} = req.body;
//     try {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: `Следующие данные отправлены: ${formData}`,
//             }
//         })
//         return res.status(200).json({queryId});
//     } catch (e) {
//         return res.status(500).json({});
//     }
// });

app.get('/web-data', async (req, res) => {
    return res.status(200).json('Привет');
});

app.listen(PORT, () => console.log('server started on PORT ' + PORT));

