const {writeFile, readFile, readFileSync} = require("fs");
const path = require("path");
const BotAnswers = require("./botAnswers");
const jsonPath = path.join(__dirname, '..', 'assets', 'db.json');

const user = {
    first_name: "",
    last_name: "",
    // patronymic: "",
    phone: "",
    position: "",
    studyGroup: "",
    research: ""
}

async function updateUserData(chatId, userData) {

    return new Promise((resolve, reject) => {

        readFile(jsonPath, (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            let parsedData = JSON.parse(Buffer.from(data));

            if (parsedData[chatId]) {
                for (let field in userData) {
                    parsedData[chatId][field] = userData[field];
                }
            } else {
                parsedData[chatId] = user;
                for (let field in userData) {
                    parsedData[chatId][field] = userData[field];
                }
            }

        writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
            if (error) {
                console.log(error);
                reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            resolve(parsedData[chatId]);
        });
        })
})}

async function getUserData(chatId) {
    const file = await readFileSync(jsonPath);
    return JSON.parse(Buffer.from(file))[chatId];
}

// async function checkIsUserData(chatId) {
//     await getUserData(chatId).then(res => BotAnswers.sendUserData(bot, chatId, res));
//     await updateUserData(chatId, {first_name, last_name});
// }

module.exports = {updateUserData, getUserData}

