const { writeFile, readFile } = require("fs");
const path = require("path");
const jsonPath = path.join(__dirname, '..', 'assets', 'db.json')

const user = {
    first_name: "неизвестно",
    last_name: "неизвестно",
    patronymic: "неизвестно",
    phone: "неизвестно",
    position: "неизвестно",
    studyGroup: "неизвестно",
    research: "неизвестно"
}

async function updateUserData(chatId, field, value) {

    await readFile(jsonPath, (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        const parsedData = JSON.parse(Buffer.from(data));

        if(parsedData[chatId]) {
            parsedData[chatId][field] = value;
        } else {
            parsedData[chatId] = user;
            parsedData[chatId][field] = value;
        }

       writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (err) => {
            if (err) {
                console.log("Failed to write updated data to file");
                return;
            }
            console.log("Updated file successfully");
        });
    });
}

async function getUserData(chatId) {
    return readFile(jsonPath, (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        return JSON.parse(Buffer.from(data))[chatId];
    });
}

module.exports = {updateUserData, getUserData}

