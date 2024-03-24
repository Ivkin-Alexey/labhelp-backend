const {getConstantFromDB} = require("./updateConstants");
const {sendNotification} = require("./botAnswers");

async function notifyProgrammer(bot, message) {
    const programmerChatID = await getConstantFromDB("general", "programmerChatID");
    await sendNotification(bot, programmerChatID, message);
}

module.exports = {notifyProgrammer};

