const {updateUserData, deleteUser} = require("./users");
const {startWorkWithEquipment, endWorkWithEquipment} = require("./equipments");
const localisations = require("../assets/constants/localisations");
const {confirmApplication, denyApplication} = localisations.superAdministratorActions;

async function processAppPost(bot, path, body) {

    const {chatID, accountData, equipment, queryId, formData} = body;

    return new Promise((resolve, reject) => {
        switch (path) {
            case "/updatePersonData":
                resolve(updateUserData(+chatID, formData)
                    .then(userList => {
                        if (formData?.isUserConfirmed) bot.sendMessage(chatID, confirmApplication);
                        return userList;
                    }))
                break;
            case "/deletePerson":
                resolve(deleteUser(+chatID)
                    .then(personList => {
                        bot.sendMessage(chatID, denyApplication)
                        return personList
                    }));
                break;
            case "/equipmentStart":
                resolve(startWorkWithEquipment(+chatID, accountData, equipment)
                    .then(message => message))
                break;
            case "/equipmentEnd":
                resolve(endWorkWithEquipment(+chatID, accountData, equipment)
                        .then(message => message))
                break;
            default:
                reject("Ошибка")
        }
    })
}

module.exports = {processAppPost}