require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
// const fs = require("fs");
// const webAppUrl = 'https://frolicking-kleicha-94863e.netlify.app/';
// const localisations = require("./localisations.js");
const {stickers, smiles, researchTopics, constants} = require("./assets/constants");
const BotAnswers = require("./methods/botAnswers");
const BotQuestions = require("./methods/botQuestions");
const {updateUserData} = require("./methods/updateDb");
const adminChatId = constants.adminsChatId.rudkoVyacheslav;

process.on('uncaughtException', function (err) {
    console.log(err);
});

process.traceDeprecation = true;

let userLocalData = {
    first_name: "Игорь",
    last_name: "Пягай",
    phone: "+79876543210",
    position: "Магистр",
    study: "группа ТХ-10-1",
    research: "Направление \"Кремнегель\""
}

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
    const studyGroup = text.toLowerCase().includes("группа") ? text : undefined;
    const phone = validatePhoneNumber(text) ? text : undefined;

    function validatePhoneNumber(input_str) {
        const re = /^\+?[1-9]\d{10}$/;
        return re.test(input_str);
    }

        try {
            switch (text) {
                case "❌ Закрыть меню":
                    await bot.sendMessage(chatId, 'Меню закрыто', {
                                reply_markup: {
                                    remove_keyboard: true
                                }
                            })
                    break;
                case "/start":
                    await BotAnswers.sendStartMessage(bot, chatId, first_name, last_name);
                    await updateUserData(chatId, {first_name, last_name});
                    break;
                case "/researches":
                    await BotAnswers.sendResearches(bot, chatId);
                    break;
                case "/get_chat_id":
                    await bot.sendMessage(chatId, 'Чат ID: ' + chatId);
                    break;
                case "/get_my_data":
                    await BotAnswers.sendUserData(bot, chatId, userLocalData);
                    break;
                case researchBtnText:
                    await BotAnswers.sendResearch(bot, chatId, researchTopic);
                    break;
                case studyGroup:
                    await BotQuestions.askPhoneNumber(bot, chatId);
                    await updateUserData(chatId, {studyGroup});
                    break;
                case phone:
                    await updateUserData(chatId, {phone});
                    await BotAnswers.sendUserData(bot, chatId, userLocalData);
                    break;
                default:
                    await BotAnswers.sendConfusedMessage(bot, chatId);
            }
        } catch (e) {
            console.log(e);
        }

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
    const messageData = ctx.data;

    try {
        switch (messageData) {
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
                await updateUserData(chatId, {position: messageData === "bachelor" ? "бакалавр" : "магистр"});
                await BotQuestions.askEducationalGroup(bot, chatId);
                break;
            case "postgraduate":
                await updateUserData(chatId, {position: "аспирант"});
                await BotQuestions.askEducationYear(bot, chatId);
                break;
            case "adminConfirmUser":
                await bot.sendMessage(adminChatId, "Данные сохранены на сервере");
                break;
            case "userConfirmData":
                await BotQuestions.askConfirmNewUser(bot, adminChatId, userLocalData);
                break;
            case "adminDoesntConfirmUser":
                await bot.sendMessage(adminChatId, "Заявка отменена")
                break;
            case "userWantToEditData":
                await BotQuestions.askWhichFieldNeedToEdit(bot, chatId, userLocalData);
                break;
            case "1EducationYear":
            case "2EducationYear":
            case "3EducationYear":
            case "4EducationYear":
                await updateUserData(chatId, {study: messageData[0] + " год обучения"});
                await BotQuestions.askPhoneNumber(bot, chatId);
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

