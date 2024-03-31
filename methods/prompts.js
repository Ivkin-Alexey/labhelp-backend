const {NewReagentApplication} = require("../assets/constants/reagents");
const {getConstantFromDB} = require("./updateConstants");
const path = require("path");
const {Prompt} = require("../assets/constants/prompt");
const {readJsonFile, writeJsonFile} = require("./fs");
const {sendNotification} = require("./botAnswers");
const {notifyProgrammer} = require("./notifications");
const {localisations} = require("../assets/constants/constants");
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'prompts.json');

async function sendPrompt(bot, chatID, msg, keyboard, promptData) {
    return new Promise((resolve, reject) => {
        try {
            const prompt = bot.sendMessage(chatID, msg, {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
            resolve(prompt);
        } catch (e) {
            reject(e);
        }
    })
}

async function updatePrompts(id, topic, data) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => {
                if (!parsedData[topic]) {
                    reject(localisations.prompts.topicDoesntExist)
                } else {
                    parsedData[topic] = parsedData[topic].map(el => {
                            if(el.messageID === id) {
                                for(let key in data) {
                                    el[key] = data[key];
                                }
                            }
                        }
                    )
                }
                writeJsonFile(jsonPath, parsedData)
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
};

async function addNewPromptToDB(id, topic, data) {

    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => {
                if (!parsedData[topic]) {
                    parsedData[topic] = [];
                }
                const prompt = new Prompt(id, topic, data);
                parsedData[topic].push(prompt);
                writeJsonFile(jsonPath, parsedData)
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
};

async function getPrompt(bot, id, topic) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => {
                const prompt = parsedData[topic].find(el => el.messageID === id);
                resolve(prompt);
            })
            .catch(e => reject(e));
    });
}

async function deletePrompt(id, topic) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(async parsedData => {
                if (!parsedData[topic]) {
                    reject("Промпты с такой темой отсутствуют");
                } else {
                    parsedData[topic] = parsedData[topic].filter(el => el.messageID !== id);
                }
                await writeJsonFile(jsonPath, parsedData)
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
};

module.exports = {sendPrompt, updatePrompts, deletePrompt, getPrompt, addNewPromptToDB};