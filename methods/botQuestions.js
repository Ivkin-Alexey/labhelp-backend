const {stickers, constants} = require("../assets/db");

const adminChatId = constants.adminsChatId.rybchenkoSvetlana;

async function askUserPosition(bot, chatId) {
    await bot.sendMessage(chatId, "Выбери категорию обучающегося: ", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Бакалавр', callback_data: "bachelor"}],
                [{text: 'Магистр', callback_data: "master"}],
                // [{text: 'Аспирант', callback_data: "postgraduate"}],
            ]
        },
    })
}

async function askEducationalGroup(bot, chatId) {
    await bot.sendMessage(chatId, "Напиши название своей учебной группы, начиная со слова \"группа\", например, \"группа ТХ-10-1\"")
}

async function askPhoneNumber(bot, chatId) {
    await bot.sendMessage(chatId, "Напиши свой номер телефона в формате  \"+79876543210\"");
}

async function askConfirmNewUser(bot, first_name, last_name) {
    await bot.sendMessage(adminChatId, `Новая заявка: ${last_name} ${first_name}`, {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Подтвердить', callback_data: "adminConfirmUser"}],
                [{text: 'Отменить', callback_data: "adminDoesntConfirmUser"}],
            ]
        },
    });
}


module.exports = {askUserPosition, askEducationalGroup, askPhoneNumber, askConfirmNewUser};