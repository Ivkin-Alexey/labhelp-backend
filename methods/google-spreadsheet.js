require('dotenv').config();
const GoogleSpreadsheet = require('google-spreadsheet');
const JWT = require('google-auth-library');
const equipmentOperationsTableID = "1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE";
const equipmentListTableID = "1DzK7-8XCBOmPmmtTpVOR_kEYh1oVfyQD4sUODwKmQK0";
const equipmentListSheetID = "1818094136";
const imgColumn = "E";
const imgUrl = `https://docs.google.com/spreadsheets/d/${equipmentListTableID}/edit#gid=${equipmentListSheetID}&range=`;
const {createDate, createTime, createFullName} = require("./helpers");
const {EquipmentItem} = require("../assets/constants");
const localisations = require("../assets/localisations");

const successMsg = localisations.postRequests.startEquipment.success;

const serviceAccountAuth = new JWT.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const equipmentOperations = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentOperationsTableID, serviceAccountAuth);
const equipmentList = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentListTableID, serviceAccountAuth);

function StartData(chatID, accountData, equipment) {
    this.id = equipment.id,
    this.date = createDate(),
    this.startTime = createTime(),
    this.fullName = createFullName(accountData),
    this.chatID = chatID,
    this.position = accountData.position,
    this.name = equipment.name + " " + equipment.model
}

async function startWorkWithEquipment(chatID = 392584400, accountData, equipment) {
    return new Promise(async (resolve, reject) => {
        try {
            await equipmentOperations.loadInfo();
            let sheet = equipmentOperations.sheetsByIndex[0];
            const data = new StartData(chatID, accountData, equipment);
            await sheet.addRow(data);
            resolve(successMsg);
        } catch (e) {
            reject(e);
        }

    })

}

async function fetchEquipmentListFromGSheet() {
    return new Promise(async (resolve, reject) => {
        try {
            const equipment = [];
            await equipmentList.loadInfo();
            let sheet = equipmentList.sheetsById[equipmentListSheetID];
            const rows = await sheet.getRows();
            for(let i = 10; i < 100; i++) {
                const newEquipmentItem = new EquipmentItem;
                newEquipmentItem.name = rows[i].get("Наименование оборудования");
                newEquipmentItem.brand = rows[i].get("Изготовитель");
                newEquipmentItem.model = rows[i].get("Модель");
                newEquipmentItem.category = rows[i].get("Категория");
                newEquipmentItem.imgUrl = imgUrl + imgColumn + (i + 2);
                newEquipmentItem.filesUrl = rows[i].get("Файлы");
                newEquipmentItem.id = rows[i].get("Заводской №") + newEquipmentItem.model;
                equipment.push(newEquipmentItem);
            }
            resolve(equipment);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {startWorkWithEquipment, fetchEquipmentListFromGSheet}