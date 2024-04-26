import {stickers} from "../assets/constants/constants.js";
import localisations from "../assets/constants/localisations.js";
import {updateUserData, checkIsUserReagentManager} from "./users.js";
import {sendResearches, sendWebAppButtonWithMessage, sendNotification} from "./botAnswers.js";
import {getReagentApplication} from "./reagents.js";
import {updatePrompts, deletePrompt, getPrompt} from "./prompts.js";
import {notifyProgrammer} from "./notifications.js";

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

export {processCallbackQuery}