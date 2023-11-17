require('dotenv').config();
const GoogleSpreadsheet = require('google-spreadsheet');
const JWT = require('google-auth-library');
const equipmentOperationsTableID = "1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE";
const equipmentListTableID = "1DzK7-8XCBOmPmmtTpVOR_kEYh1oVfyQD4sUODwKmQK0";
const equipmentListSheetID = "1818094136";
const imgColumn = "E";
const imgUrl = `https://docs.google.com/spreadsheets/d/${equipmentListTableID}/edit#gid=${equipmentListSheetID}&range=`;

const serviceAccountAuth = new JWT.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const equipmentOperations = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentOperationsTableID, serviceAccountAuth);
const equipmentList = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentListTableID, serviceAccountAuth);

module.exports = {equipmentList, equipmentOperations, imgUrl, imgColumn};