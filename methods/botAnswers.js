const {keyboards, stickers, researches} = require("../assets/constants");
const localisations = require("../localisations");
const fs = require("fs");

const {getUserData} = require("./updateDb");

async function sendStartMessage(bot, chatId, first_name, last_name) {
    await bot.sendSticker(chatId, stickers.hello).then();
    await bot.sendMessage(chatId, `Привет ${last_name} ${first_name}! ` + localisations.startMessage, {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Да', callback_data: "Yes"}, {text: 'Нет', callback_data: "No"}],
            ]
        }
    })
}

async function sendResearches(bot, chatId) {
    await bot.sendMessage(chatId, localisations.selectResearches, {
        reply_markup: {
            keyboard: keyboards.researches,
        },
        isResearch: true
    })
}

async function sendResearch(bot, chatId, researchTopic) {
    const research = researches.find(el=>el.name === researchTopic);
    const {id, degree, advisor} = research;
    const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`);
    await bot.sendPhoto(chatId, imageStream );
    await bot.sendMessage(chatId, "Руководитель направления: " + degree + " " + advisor,);
    await bot.sendMessage(chatId, "Описание направления. Описание направления. Описание направления. Описание направления.", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Присоединиться', callback_data: "joinUs"}],
            ]
        },
        disable_notification: true
    })
}

async function sendConfusedMessage(bot, chatId) {
    await bot.sendSticker(chatId, stickers.unknown);
    await bot.sendMessage(chatId, localisations.iDontUnderstand);
}

async function sendUserData(bot, chatId) {
    const userData = await getUserData(chatId);
    await bot.sendMessage(chatId, userData);
}

module.exports = {sendResearch, sendStartMessage, sendResearches, sendConfusedMessage, sendUserData};