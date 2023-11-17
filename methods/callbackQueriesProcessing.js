const {stickers, superAdminsChatID} = require("../assets/constants/constants");
const localisations = require("../assets/localisations");
const {invitationToRegistration} = localisations.botAnswers;
const BotAnswers = require("./botAnswers");
const {updateUserData} = require("./updateDb");

async function processCallbackQuery(bot, chatID, messageData) {
    let answer = undefined;

    if(messageData?.userAnswer) answer = messageData.userAnswer;
    if(messageData?.research) answer = "research";
    switch (answer) {
        case "Yes":
            await bot.sendSticker(chatID, stickers.agree);
            await BotAnswers.sendResearches(bot, chatID);
            break;
        case "No":
            await bot.sendSticker(chatID, stickers.disagree);
            break;
        case "research":
            await bot.sendSticker(chatID, stickers.ok);
            await updateUserData(chatID, messageData);
            await BotAnswers.sendWebAppButtonWithMessage(bot, chatID, invitationToRegistration);
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