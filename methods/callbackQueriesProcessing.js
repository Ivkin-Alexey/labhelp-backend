const {stickers, superAdminsChatID} = require("../assets/constants/constants");
const localisations = require("../assets/constants/localisations");
const {updateUserData} = require("./users");
const {sendResearches, sendWebAppButtonWithMessage} = require("./botAnswers");

const {invitationToRegistration} = localisations.botAnswers;

async function processCallbackQuery(bot, chatID, messageData) {
    let answer = undefined;

    if(messageData?.userAnswer) answer = messageData.userAnswer;
    if(messageData?.research) answer = "research";
    switch (answer) {
        case "Yes":
            await bot.sendSticker(chatID, stickers.agree);
            await updateUserData(chatID, {firstName: messageData.first_name, lastName: messageData.last_name, chatID});
            await sendResearches(bot, chatID);
            break;
        case "No":
            await bot.sendSticker(chatID, stickers.disagree);
            break;
        case "research":
            await bot.sendSticker(chatID, stickers.ok);
            await updateUserData(chatID, messageData);
            await sendWebAppButtonWithMessage(bot, chatID, invitationToRegistration);
            break;
        case "adminConfirmUser":
            await bot.sendMessage(superAdminsChatID[0], "Данные сохранены на сервере");
            break;
        case "adminDoesntConfirmUser":
            await bot.sendMessage(superAdminsChatID[0], "Заявка отменена")
            break;
    }
}

module.exports = {processCallbackQuery}