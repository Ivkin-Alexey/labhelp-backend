require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const https = require('https');
const http = require('http');
const {researchesSelectOptions} = require("./assets/constants");
const localisations = require("./assets/localisations");
const {confirmApplication, denyApplication} = localisations.superAdministratorActions;
const BotAnswers = require("./methods/botAnswers");
const {checkTextIsResearch} = require("./methods/validation");
const {processCallbackQuery} = require("./methods/callbackQueriesProcessing");
const {startWorkWithEquipment} = require("./methods/google-spreadsheet");
const {checkIsUserSuperAdmin} = require("./methods/helpers");
const {updateUserData, getUserList, deleteUser, addRandomUser, deleteUsersWithEmptyChatID,
    createEquipmentDbFromGSheet, getEquipmentList
} = require("./methods/updateDb");

process.on('uncaughtException', function (err) {
    console.log(err);
});

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const app = express();
const PORT = 8000;
const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

app.use(express.json());
app.use(cors());
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
}, app);

bot.on('message', async msg => {
    const chatID = msg.chat.id;
    let text = msg.text;
    const {first_name, last_name} = msg.chat;
    const isResearch = checkTextIsResearch(text);
    if (isResearch) text = isResearch;

    try {
        switch (text) {
            case "❌ Закрыть меню":
                await bot.sendMessage(chatID, 'Меню закрыто', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
                break;
            case "/start":
                await BotAnswers.sendStartMessage(bot, chatID, first_name, last_name);
                await updateUserData(chatID, {firstName: first_name, lastName: last_name, chatID});
                break;
            case "/addRandomUser":
                await addRandomUser();
                break;
            case "/addRandomAdmin":
                await addRandomUser("admin");
                break;
            case "/addRandomSuperAdmin":
                await addRandomUser("superAdmin");
                break;
            case "/deleteUsersWithEmptyChatID":
                await deleteUsersWithEmptyChatID(chatID).then(res => console.log(res));
                break;
            case "/researches":
                await BotAnswers.sendResearches(bot, chatID);
                break;
            case "/get_chat_id":
                await bot.sendMessage(chatID, 'Чат ID: ' + chatID);
                break;
            case "/startEquipment":
                await startWorkWithEquipment(chatID);
                break;
            case "/reloadEquipmentDB":
                const result = checkIsUserSuperAdmin(chatID);
                if(result.resolved) {
                    await createEquipmentDbFromGSheet().then(r => console.log(r));
                } else {
                    await bot.sendMessage(chatID, result.errorMsg);
                }
                break;
            // case "/get_my_data":
            //     await getUserData(chatID).then(res => BotAnswers.sendUserData(bot, chatID, res));
            //     break;
            case isResearch:
                await BotAnswers.sendResearch(bot, chatID, isResearch);
                await updateUserData(chatID, {research: isResearch});
                break;
            default:
                await BotAnswers.sendConfusedMessage(bot, chatID);
        }
    } catch (e) {
        console.log(e);
    }

    // if (msg?.web_app_data?.data) {
    //     try {
    //         const data = JSON.parse(msg?.web_app_data?.data)git
    //         await bot.sendMessage(chatID, 'Спасибо за обратную связь!' + JSON.stringify(data));
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
});

bot.on('callback_query', async ctx => {
    const chatID = ctx.message.chat.id;
    let messageData = JSON.parse(ctx.data);
    try {
        await processCallbackQuery(bot, chatID, messageData);
    } catch (error) {
        console.log(error);
    }
});

app.post('/updatePersonData', async (req, res) => {
    const {queryId, formData, chatID} = req.body;
    try {
        return await updateUserData(+chatID, formData)
            .then(userList => res.status(200).json(userList)).then(async () => {
                if (formData?.isUserConfirmed) await bot.sendMessage(chatID, confirmApplication);
            });
        // await bot.answerWebAppQuery(queryId, {
        //     type: 'article',
        //     id: queryId,
        //     title: 'Успешная покупка',
        //     input_message_content: {
        //         message_text: "Ваши данные обновлены",
        //     }
        // })
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.post('/deletePerson', async (req, res) => {
    const {chatID} = req.body;
    try {
        return await deleteUser(+chatID)
            .then(personList => res.status(200).json(personList))
            .then(async () => await bot.sendMessage(chatID, denyApplication));
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.get('/hello', async (req, res) => {
    return res.status(200).json('Привет');
});

app.get('/equipmentList', async (req, res) => {
    try {
        return await getEquipmentList().then(equipmentList => res.status(200).json(equipmentList))
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.get('/persons', async (req, res) => {
    try {
        return await getUserList().then(personList => res.status(200).json(personList))
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.get('/researches', async (req, res) => {
    try {
        return res.status(200).json(researchesSelectOptions);
    } catch (e) {
        return res.status(500).json(e);
    }
});

httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
})

httpsServer.listen(443, () => {
    console.log(`HTTP Server running on port ${443}`);
})
