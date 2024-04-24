const {stickers, superAdminsChatID} = require("../assets/constants/constants");
const localisations = require("../assets/constants/localisations");
const {updateUserData, checkIsUserReagentManager} = require("./users");
const {sendResearches, sendWebAppButtonWithMessage, sendNotification} = require("./botAnswers");
const {getReagentApplication, updateReagentApplications} = require("./reagents");
const {updatePrompts, deletePrompt, getPrompt} = require("./prompts");
const {notifyProgrammer} = require("./notifications");

const {invitationToRegistration} = localisations.botAnswers;
const {appConfirmation, appRejection, appConfirmationForManager} = localisations.reagents.notifications;

async function processCallbackQuery(bot, ctx) {
    const {id, first_name, last_name} = ctx.message.chat;
    const msgID = ctx.message?.message_id;
    const chatID = id;
    let messageData = JSON.parse(ctx.data);
    messageData.first_name = first_name;
    messageData.last_name = last_name;

    try {
        let answer = undefined;
        if (messageData?.answer) answer = messageData.answer;
        if (messageData?.research) answer = "research";
        switch (answer) {
            case "Yes":
                await bot.sendSticker(chatID, stickers.agree);
                await updateUserData(chatID, {
                    firstName: messageData.first_name,
                    lastName: messageData.last_name,
                    chatID
                });
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
            case "confirm":
                await processReagentAppConfirmation(chatID, msgID, bot);
                break;
            case "reject":
                await bot.sendMessage(superAdminsChatID[0], "Заявка отменена")
                break;
        }
    } catch (error) {
        console.log(error);
    }
}

async function processReagentAppConfirmation(reagentManagerChatID, msgID, bot) {
        try {
            await checkIsUserReagentManager(reagentManagerChatID)
                .then(() => getPrompt(bot, msgID, "reagents"))
                .then(prompt => {
                    console.log(prompt);
                    updateReagentApplications(prompt.data.appID, {status: "confirmed"})
                        .then(() => sendNotification(bot, prompt.data.chatID, appConfirmation))
                })
                .then(() => sendNotification(bot, reagentManagerChatID, appConfirmationForManager))
                // .then(() => updateDataInReagentGSheet())
                .then(() => deletePrompt(msgID, "reagents"))
        } catch (e) {
            await notifyProgrammer(bot, e);
        }
}

module.exports = {processCallbackQuery}