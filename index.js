require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {app} = require("./server")
const {researchesSelectOptions} = require("./assets/constants/researches");
const {getUserList} = require("./methods/users");
const {getEquipmentList} = require("./methods/equipments");
const {updateUserDataPost, deletePersonPost, equipmentStartPost, equipmentEndPost} = require("./methods/appPostsProcessing");
const {processCallbackQuery} = require("./methods/callbackQueriesProcessing");
const {processCommand} = require("./methods/commands");

process.on('uncaughtException', function (err) {
    console.log(err);
});

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.on('message', msg => processCommand(bot, msg));

bot.on('callback_query', async ctx => {
    const {id, first_name, last_name} = ctx.message.chat;
    let messageData = JSON.parse(ctx.data);
    messageData.first_name = first_name;
    messageData.last_name = last_name;
    try {
        await processCallbackQuery(bot, id, messageData);
    } catch (error) {
        console.log(error);
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

app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));

