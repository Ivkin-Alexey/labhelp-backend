const {NewReagentApplication} = require("../assets/constants/reagents");
const {getConstantFromDB} = require("./updateConstants");
const path = require("path");
const {Prompt} = require("../assets/constants/prompt");
const {readJsonFile, writeJsonFile} = require("./reagents");
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'prompts.json');

async function sendPrompt(bot, chatID, msg, keyboard, topic, promptData) {
    const prompt = await bot.sendMessage(chatID, msg, {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });

    await updatePrompts(prompt.message_id, topic, promptData);
}

async function updatePrompts(id, topic, data) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(async parsedData => {
                if (!parsedData[topic]) {
                    parsedData[topic] = [];
                    const prompt = new Prompt(id, topic, data);
                    parsedData[topic].push(prompt);
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
                await writeJsonFile(jsonPath, parsedData)
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
};

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

module.exports = {sendPrompt, updatePrompts, deletePrompt};