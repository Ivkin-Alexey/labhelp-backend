const fs = require("fs");
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {processCallbackQuery} = require("./methods/callbackQueriesProcessing");
const {processCommand} = require("./methods/commands");

process.on('uncaughtException', err => console.log(err));

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async msg => await processCommand(bot, msg));
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx));

const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");

const {PORT, HTTPS_PORT} = require("./assets/constants/constants");
const {getEquipmentList} = require("./methods/equipments");
const {getUserList} = require("./methods/users");
const {researchesSelectOptions} = require("./assets/constants/researches");
const {
    updateUserDataPost,
    deletePersonPost,
    equipmentStartPost,
    equipmentEndPost,
    updateReagentApplicationPost, deleteReagentApplicationPost, addNewReagentAppToDBPost
} = require("./methods/appPostsProcessing");
const {getReagentApplications, addNewReagentAppToDB} = require("./methods/reagents");
const {getWorkingEquipmentListFromDB} = require("./methods/db/equipment");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
}, app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
})

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
})

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

app.get('/workingEquipmentList', async (req, res) => {
    try {
        return await getWorkingEquipmentListFromDB().then(list => res.status(200).json(list))
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.get('/persons', async (req, res) => {
    try {
        return await getUserList().then(personList => res.status(200).json(personList));
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

app.get('/reagentApplications', async (req, res) => {
    try {
        return await getReagentApplications().then(list => res.status(200).json(list));
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));
app.post("/deleteReagentApplication", async (req, res) => await deleteReagentApplicationPost(req, res, bot));
app.post("/updateReagentApplications", async (req, res) => await updateReagentApplicationPost(req, res, bot));
app.post("/addNewReagentAppToDB", async (req, res) => await addNewReagentAppToDBPost(req, res, bot));