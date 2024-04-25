import fs from "fs";
import {keyboards, stickers, researches, editProfileUrl, userCommands, superAdminCommands} from "../assets/constants/constants.js";
import localisations from "../assets/constants/localisations.js";
import {personRoles} from "../assets/constants/users.js";
import {checkIsUserAdmin, getUserData} from "./users.js";

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

async function sendWebAppButtonWithMessage(bot, chatID, message) {
    editProfileUrl = editProfileUrl.replace(":chatID", chatID);
    await bot.sendMessage(chatID, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Заполнить', web_app: {url: editProfileUrl}},
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

async function sendCommandList(bot, chatID) {
    const {user} = personRoles;
    await getUserData(chatID)
        .then(userData => {
            if(userData.role === user) bot.sendMessage(chatID, userCommands);
            else bot.sendMessage(chatID, superAdminCommands);
        })
        .catch((err) => bot.sendMessage(chatID, err));
}

async function sendNotification(bot, chatID, message) {
    await bot.sendMessage(chatID, message);
}

async function sendResearch(bot, chatID, researchTopic) {
    editProfileUrl = editProfileUrl.replace(":chatID", chatID);
    const research = researches.find(el => el.name === researchTopic);
    const {id, degree, advisor} = research;
    const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`);
    await bot.sendPhoto(chatID, imageStream);
    await bot.sendMessage(chatID, "Руководитель направления: " + degree + " " + advisor,);
    await bot.sendMessage(chatID, "Описание направления. Описание направления. Описание направления. Описание направления.", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Присоединиться', callback_data: JSON.stringify({research: researchTopic})}],
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
    const {first_name, last_name, phone, position, study, research} = userData;
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

module.exports = {sendResearch, sendStartMessage, sendResearches, sendConfusedMessage, sendWebAppButtonWithMessage, sendCommandList, sendNotification};