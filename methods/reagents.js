const {readFile, writeFile} = require("fs");
const path = require("path");
const {NewReagentApplication} = require("../assets/constants/reagents.js");

const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'reagents.json');

async function updateReagentApplications(userData, applicationData) {
    const applicationID = applicationData.id ?? null;

    return new Promise((resolve, reject) => {
        readJsonFile(jsonPath)
            .then(parsedData => {
                if(!applicationID) {
                    const newApplication = new NewReagentApplication(userData);
                    for (let key in applicationData) {
                        newApplication[key] = applicationData[key];
                    }
                    parsedData.push(newApplication)
                } else {
                    parsedData = parsedData.map(el => {
                        if(el.id === applicationID) {
                            for (let key in applicationData) {
                                el[key] = applicationData[key];
                            }
                        }
                        return el;
                    })
                }
                writeJsonFile(jsonPath, parsedData)
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