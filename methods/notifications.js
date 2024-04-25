import {getConstantFromDB} from "./updateConstants.js";
import {sendNotification} from "./botAnswers.js";

async function notifyProgrammer(bot, message) {
    const programmerChatID = await getConstantFromDB("general", "programmerChatID");
    await sendNotification(bot, programmerChatID, message);
}

module.exports = {notifyProgrammer};

