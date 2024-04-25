const constants from "../assets/constants/constants";
const {CEOChatID} = constants.constants;
const {researches, keyboards} = constants;

async function askIsUserAdvisor(bot, userChatId) {
    const text = "Подтвердите руководителя";

    await bot.sendMessage(CEOChatID, text, {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Подтвердить', callback_data: "CEOConfirmedAdvisor" + userChatId}, {text: 'Отменить', callback_data: "CEORejectedAdvisor" + userChatId}],
            ]
        }
    });
}

async function askResearch(bot, userChatId) {
    const text = "Выберете направление";

    await bot.sendMessage(CEOChatID, text, {
        reply_markup: {
            inline_keyboard: [
                ...keyboards.researches, [{text: 'Отменить', callback_data: "CEORejectedAdvisor" + userChatId}],
            ]
        }
    });
}



module.exports = {askIsUserAdvisor};