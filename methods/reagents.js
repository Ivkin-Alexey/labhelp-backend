const {readFile, writeFile} = require("fs");
const path = require("path");
const bot = require("../index");
const {NewReagentApplication} = require("../assets/constants/reagents.js");
const {getConstantFromDB} = require("./updateConstants");
const localisations = require("../assets/constants/localisations");

const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'reagents.json');

async function updateReagentApplications(userData, applicationData, bot) {
    const applicationID = applicationData.id ?? null;
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(async parsedData => {
                if (!applicationID) {
                    const newApplication = new NewReagentApplication(userData);
                    for (let key in applicationData) {
                        newApplication[key] = applicationData[key];
                    }
                    const reagentManagerChatID = await getConstantFromDB("reagents", "reagentsManagerChatID");
                    await sendReagentApplicationDataToManager(reagentManagerChatID, newApplication, bot);
                    parsedData.push(newApplication)
                } else {
                    parsedData = parsedData.map(el => {
                        if (el.id === applicationID) {
                            for (let key in applicationData) {
                                el[key] = applicationData[key];
                            }
                        }
                        return el;
                    })
                }
                await writeJsonFile(jsonPath, parsedData)
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
}

async function getReagentApplications(applicationID) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => resolve(parsedData))
            .catch(e => reject(e))
    })
}

async function deleteReagentApplication(applicationID) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => {
                parsedData = parsedData.filter(el => el.id !== applicationID);
                writeJsonFile(jsonPath, parsedData);
                resolve(parsedData)
            })
            .catch(e => reject(e))
    })
}

async function sendReagentApplicationDataToManager(managerChatID, applicationData, bot) {
    const id = applicationData.id.toString();

    await bot.sendMessage(managerChatID, createApplication(applicationData), {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Подтвердить', callback_data: JSON.stringify({topic: "reagents", applicationID: id})},
                    {text: 'Отклонить', callback_data: JSON.stringify({topic: "reagents", applicationID: id})}
                ],
            ]
        }
    })
}

function createApplication(applicationData) {
    const {fullName, reagentName, reagentAmount, date} = applicationData;
    return 'Новая заявка:' + '\n' + 'Дата:' + date + '\n' + 'ФИО: ' + fullName + '\n' + 'Реактив: ' + reagentName + '\n' + 'Количество: ' + reagentAmount
}

async function readJsonFile(path) {
    return new Promise((resolve, reject) => {
        readFile(path, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            const parsedData = JSON.parse(Buffer.from(data));
            resolve(parsedData);
        })
    })
}

async function writeJsonFile(path, parsedData) {
    return new Promise((resolve, reject) => {
        writeFile(path, JSON.stringify(parsedData, null, 2), (error) => {
            if (error) {
                reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            resolve();
        });
    })
}

module.exports = {updateReagentApplications, deleteReagentApplication, getReagentApplications}