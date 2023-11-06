require('dotenv').config();
const GoogleSpreadsheet = require('google-spreadsheet');
const JWT = require('google-auth-library');
const spreadSheetID = '1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE';
const {createDate, createTime} = require("./helpers");

const serviceAccountAuth = new JWT.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const doc = new GoogleSpreadsheet.GoogleSpreadsheet(spreadSheetID, serviceAccountAuth);
module.exports = {doc};

function StartData(chatID, equipmentID) {
    this.Оборудование = equipmentID,
    this.Дата = createDate(),
    this.Начало = createTime(),
    this.ФИО = "Ивкин Алексей Сергеевич",
    this.ChatID = chatID
}

loadDoc();
async function loadDoc() {
    await doc.loadInfo();
}

function startWorkWithEquipment(chatID = 392584400, equipmentID = 1) {
    let sheet = doc.sheetsByIndex[0];
    const data = new StartData(chatID, equipmentID);
    (async () => await sheet.addRow(data))();
}



module.exports = {startWorkWithEquipment}