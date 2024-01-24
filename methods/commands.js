const {checkTextIsResearch} = require("./validation");
const {sendStartMessage, sendResearches, sendResearch, sendConfusedMessage} = require("./botAnswers");
const {addRandomUser, deleteUsersWithEmptyChatID, updateUserData} = require("./users");
const {reloadEquipmentDB} = require("./equipments");
async function processCommand(bot, command) {
    const chatID = command.chat.id;
    let text = command.text;
    const {first_name, last_name} = command.chat;
    const isResearch = checkTextIsResearch(text);
    if (isResearch) text = isResearch;

    try {
        switch (text) {
            case "❌ Закрыть меню":
                await bot.sendMessage(chatID, 'Меню закрыто', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
                break;
            case "/start":
                await sendStartMessage(bot, chatID, first_name, last_name);
                break;
            case "/addRandomUser":
                await addRandomUser();
                break;
            case "/addRandomAdmin":
                await addRandomUser("admin");
                break;
            case "/addRandomSuperAdmin":
                await addRandomUser("superAdmin");
                break;
            case "/deleteUsersWithEmptyChatID":
                await deleteUsersWithEmptyChatID(chatID);
                break;
            case "/researches":
                await sendResearches(bot, chatID);
                break;
            case "/get_chat_id":
                await bot.sendMessage(chatID, 'Чат ID: ' + chatID);
                break;
            case "/reloadEquipmentDB":
                await reloadEquipmentDB(bot, chatID);
                break;
            // case "/get_my_data":
            //     await getUserData(chatID).then(res => sendUserData(bot, chatID, res));
            //     break;
            case isResearch:
                await sendResearch(bot, chatID, isResearch);
                await updateUserData(chatID, {research: isResearch});
                break;
            default:
                await sendConfusedMessage(bot, chatID);
        }
    } catch (e) {
        console.log(e);
    }

    // if (command?.web_app_data?.data) {
    //     try {
    //         const data = JSON.parse(command?.web_app_data?.data)git
    //         await bot.sendMessage(chatID, 'Спасибо за обратную связь!' + JSON.stringify(data));
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}

module.exports = {processCommand};