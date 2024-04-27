import path from "path";
import {NewReagentApplication} from "../assets/constants/reagents.js";
import {getConstantFromDB} from "./updateConstants.js";
import localisations from "../assets/constants/localisations.js";
import {sendPrompt, addNewPromptToDB} from "./prompts.js";
import {readJsonFile, writeJsonFile} from "./fs.js";
import __dirname from "../utils/__dirname.js";

const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'reagents.json');


async function updateReagentApps(appID, updatedData) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(async parsedData => {
                    parsedData = parsedData.map(el => {
                        if (el.id === appID) {
                            for (let key in updatedData) {
                                el[key] = updatedData[key];
                            }
                        }
                        return el;
                    })
                await writeJsonFile(jsonPath, parsedData);
                resolve(parsedData);
                })
            .catch(e => reject(e))
    });
}

async function addNewReagentAppToDB(userData, applicationData, bot) {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(async parsedData => {
                const newApplication = new NewReagentApplication(userData);
                for (let key in applicationData) {
                    newApplication[key] = applicationData[key];
                }
                parsedData.push(newApplication)
                await writeJsonFile(jsonPath, parsedData);
                resolve(newApplication);
            })
            .catch(e => reject(e));
    });
}

async function getReagentApplications() {
    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => resolve(parsedData))
            .catch(e => reject(e))
    })
}

async function getReagentApplication(applicationID) {
    return await getReagentApplications()
        .then(list => list.find(el => el.id === applicationID))
        .catch(e => e);
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

async function sendReagentAppDataToManager(appData, bot) {
    const reagentManagerChatID = await getConstantFromDB("reagents", "reagentsManagerChatID");
    const id = appData.id.toString();
    const promptData = {appID: id, chatID: appData.chatID};
    const keyboard = [
        [
            {text: 'Подтвердить', callback_data: JSON.stringify({answer: "confirm"})},
            {text: 'Отклонить', callback_data: JSON.stringify({answer: "reject"})}
        ],
    ];
    await sendPrompt(bot, reagentManagerChatID, createApplication(appData), keyboard, promptData)
        .then(prompt => addNewPromptToDB(prompt.message_id, "reagents", promptData));
}

function createApplication(applicationData) {
    const {fullName, reagentName, reagentAmount, date} = applicationData;
    return 'Новая заявка: ' + '\n' + 'Дата: ' + date + '\n' + 'ФИО: ' + fullName + '\n' + 'Реактив: ' + reagentName + '\n' + 'Количество: ' + reagentAmount
}

export {
    updateReagentApps,
    deleteReagentApplication,
    getReagentApplications,
    getReagentApplication,
    addNewReagentAppToDB,
    sendReagentAppDataToManager
}