const {keyboards, stickers, researches, webAppUrl} = require("../assets/constants");
const localisations = require("../localisations");
const fs = require("fs");

const {getUserData} = require("./updateDb");

async function sendStartMessage(bot, chatID, first_name, last_name) {
    await bot.sendSticker(chatID, stickers.hello);
    await bot.sendMessage(chatID, `Привет ${last_name} ${first_name}! ` + localisations.startMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Да', callback_data: JSON.stringify({userAnswer: "Yes"})},
                    {text: 'Нет', callback_data: JSON.stringify({userAnswer: "No"})}
                ],
            ]
        }
    })
}

async function sendResearches(bot, chatID) {
    const keyboard = [...keyboards.researches, ['❌ Закрыть меню']];
    await bot.sendMessage(chatID, localisations.selectResearches, {
        reply_markup: {
            keyboard,
        },
        isResearch: true
    })
}

async function sendResearch(bot, chatID, researchTopic) {
    const editProfileUrl = webAppUrl + `/${chatID}/editProfile`;
    const research = researches.find(el => el.name === researchTopic);
    const {id, degree, advisor} = research;
    const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`);
    await bot.sendPhoto(chatID, imageStream);
    await bot.sendMessage(chatID, "Руководитель направления: " + degree + " " + advisor,);
    await bot.sendMessage(chatID, "Описание направления. Описание направления. Описание направления. Описание направления.", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Присоединиться', web_app: {url: editProfileUrl}}],
            ]
        },
        disable_notification: true,
    })
}

async function sendConfusedMessage(bot, chatID) {
    await bot.sendSticker(chatID, stickers.unknown);
    await bot.sendMessage(chatID, localisations.iDontUnderstand);
}

async function sendUserData(bot, chatID, userData) {
    const {first_name, last_name,phone, position, study, research} = userData;
    await bot.sendMessage(chatID,
        `Мои данные: \n${research}\n${position}, ${study}\n${last_name} ${first_name}\n${phone}`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Подтвердить', callback_data: JSON.stringify({userAnswer: "userConfirmData"})}],
                    [{text: 'Редактировать', callback_data: JSON.stringify({userAnswer: "userWantToEditData"})}],
                ]
            },
        });
}

module.exports = {sendResearch, sendStartMessage, sendResearches, sendConfusedMessage, sendUserData};