const {writeFile, readFile, readFileSync} = require("fs");
const path = require("path");
const BotAnswers = require("./botAnswers");
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'db.json');
const jsPath = path.join(__dirname, '..', 'assets', 'db', 'db_users.js');
const users = require(jsPath);

const user = {
    first_name: "",
    last_name: "",
    // patronymic: "",
    phone: "",
    position: "",
    studyGroup: "",
    research: ""
}

// async function updateUserData(chatId, userData) {
//
//     return new Promise((resolve, reject) => {
//
//         readFile(jsonPath, (error, data) => {
//             if (error) {
//                 reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
//                 return;
//             }
//             let parsedData = JSON.parse(Buffer.from(data));
//
//             if (parsedData[chatId]) {
//                 for (let field in userData) {
//                     parsedData[chatId][field] = userData[field];
//                 }
//             } else {
//                 parsedData[chatId] = user;
//                 for (let field in userData) {
//                     parsedData[chatId][field] = userData[field];
//                 }
//             }
//
//         writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
//             if (error) {
//                 console.log(error);
//                 reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
//                 return;
//             }
//             resolve(parsedData[chatId]);
//         });
//         })
// })}

async function updateUserData(chatId, userData) {

    return new Promise((resolve, reject) => {

        // readFile(jsPath, 'utf8', (error, data) => {
        //     if (error) {
        //         reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
        //         return;
        //     }
        //     let parsedData = data;
        //     console.log(parsedData);
        //

        console.log(users);
            if (users[chatId]) {
                for (let field in userData) {
                    users[chatId][field] = userData[field];
                }
            } else {
                users[chatId] = user;
                for (let field in userData) {
                    users[chatId][field] = userData[field];
                }
            }

            console.log(users);

            writeFile(jsPath, Buffer.from(users), null, 2, (error) => {
                if (error) {
                    console.log(error);
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(users[chatId]);
            });
        })
    // })
}

async function getUserData(chatId) {
    const file = await readFileSync(jsonPath);
    return JSON.parse(Buffer.from(file))[chatId];
}

// async function checkIsUserData(chatId) {
//     await getUserData(chatId).then(res => BotAnswers.sendUserData(bot, chatId, res));
//     await updateUserData(chatId, {first_name, last_name});
// }

module.exports = {updateUserData, getUserData}

