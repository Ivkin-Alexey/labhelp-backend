const {stickers, constants, webAppUrl} = require("../assets/constants");
const {updateUserData} = require("./updateDb");

async function askUserPosition(bot, chatId) {
    await bot.sendMessage(chatId, "Выбери категорию обучающегося: ", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Бакалавр', callback_data: "bachelor", web_app: {url: webAppUrl}}],
                [{text: 'Магистр', callback_data: "master", web_app: {url: webAppUrl}}],
                [{text: 'Аспирант', callback_data: "postgraduate", web_app: {url: webAppUrl}}],
            ]
        },
    })
}

async function askEducationYear(bot, chatId) {
    await bot.sendMessage(chatId, "Выбери свой год обучения: ", {
        reply_markup: {
            inline_keyboard: [
                [{text: '1', callback_data: "1EducationYear"}, {text: '2', callback_data: "2EducationYear"}],
                [{text: '3', callback_data: "3EducationYear"}, {text: '4', callback_data: "4EducationYear"}],
            ]
        },
    })
}

async function askEducationalGroup(bot, chatId) {
    const prompt = await bot.sendMessage(chatId, "Напиши название своей учебной группы, например, \"ТХ-10-1\"", {
        reply_markup: {
            force_reply: true,
        },
    });
    bot.onReplyToMessage(chatId, prompt.message_id, async function (answer) {
        console.log(answer);
        await updateUserData(chatId, {study: answer.text});
            });
}

async function askPhoneNumber(bot, chatId) {
    await bot.sendMessage(chatId, "Напиши свой номер телефона в формате  \"+79876543210\"");
}

async function askConfirmNewUser(bot, adminChatId, userData) {
    const {first_name, last_name, patronymic, phone, position, study, research} = userData;
    await bot.sendMessage(adminChatId,
        `Новая заявка: \n${research}\n${position}, ${study}\n${last_name} ${first_name}\n${phone}`, {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Подтвердить', callback_data: "adminConfirmUser"}],
                [{text: 'Отменить', callback_data: "adminDoesntConfirmUser"}],
            ]
        },
    });
}

async function askWhichFieldNeedToEdit(bot, chatId, userLocalData) {
    let keyboard = [];
    for(let field in userLocalData) {
        keyboard.push([{text: userLocalData[field], callback_data: "userWantToEdit_" + field}])
    }
    await bot.sendMessage(chatId, "Какие данные редактировать?", {
        reply_markup: {
            inline_keyboard: keyboard
        },
    });
}



module.exports = {askUserPosition, askEducationalGroup, askPhoneNumber, askConfirmNewUser,askWhichFieldNeedToEdit, askEducationYear};