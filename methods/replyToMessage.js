const {updateConstantsDB} = require("./updateConstants");

async function askReagentsManagerChatID(bot, chatID) {
    const prompt = await bot.sendMessage(chatID, "Введите chatID менеджера по реактивам", {
        reply_markup: {
            force_reply: true,
        },
    });

    bot.onReplyToMessage(chatID, prompt.message_id, async function (answer) {
        await updateConstantsDB("reagents", {reagentsManagerChatID: answer.text})
            .then(async () => await bot.sendMessage(chatID, "ChatID менеджера по реактивам обновлен: " + answer.text))
            .catch(async e => await bot.sendMessage(chatID, e,))
    });
}

module.exports = {askReagentsManagerChatID}