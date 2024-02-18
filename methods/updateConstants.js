const {readFile, writeFile} = require("fs");
const {createDate} = require("./helpers");
const {newPerson} = require("../assets/constants/users");
const path = require("path");
const constantsJsonPath = path.join(__dirname, '..', 'assets', 'db', 'constants.json');

function updateConstantsDB(field, data) {
    return new Promise((resolve, reject) => {
        readFile(constantsJsonPath, 'utf8', (error, fileData) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            let parsedData = JSON.parse(Buffer.from(fileData));
            // let isNewUser = true;
            const newData = parsedData[field];
            for (let key in data) {
                newData[key] = data[key];
            }
            parsedData = {...parsedData, [field]: newData};

            writeFile(constantsJsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(parsedData);
            });
        })
    })
}

module.exports = {updateConstantsDB};