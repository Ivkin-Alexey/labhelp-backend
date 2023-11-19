require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const https = require('https');
const http = require('http');

const {researchesSelectOptions} = require("./assets/constants/constants");
const {getCellImageUrl} = require("./assets/constants/gSpreadSheets");
const {checkIsUserSuperAdmin, updateUserData, getUserList, addRandomUser,
    deleteUsersWithEmptyChatID
} = require("./methods/users");
const {getEquipmentList, createEquipmentDbFromGSheet} = require("./methods/equipments");
const {sendResearches, sendStartMessage, sendResearch, sendConfusedMessage} = require("./methods/botAnswers");
const {processAppPost, updateUserDataPost, deletePersonPost, equipmentStartPost, equipmentEndPost} = require("./methods/appPostsProcessing");
const {checkTextIsResearch} = require("./methods/validation");

const path = require("path");
const {processCallbackQuery} = require("./methods/callbackQueriesProcessing");

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
                await sendStartMessage(bot, chatID, first_name, last_name);
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
                await sendResearches(bot, chatID);
                break;
            case "/get_chat_id":
                await bot.sendMessage(chatID, 'Чат ID: ' + chatID);
                break;
            case "/reloadEquipmentDB":
                const result = checkIsUserSuperAdmin(chatID);
                if (result.resolved) {
                    await createEquipmentDbFromGSheet().then(r => console.log(r));
                } else {
                    await bot.sendMessage(chatID, result.errorMsg);
                }
                break;
            // case "/get_my_data":
            //     await getUserData(chatID).then(res => sendUserData(bot, chatID, res));
            //     break;
            case isResearch:

                await sendResearch(bot, chatID, isResearch);
                await updateUserData(chatID, {research: isResearch});
                break;
            default:
                await sendConfusedMessage(bot, chatID);
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


app.get('/hello', async (req, res) => {
    return res.status(200).json('Привет');
});

app.get('/getCellImageUrl', async (req, res) => {
    return await getCellImageUrl().then((url) => res.status(200).json(url));
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

app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));
