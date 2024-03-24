require('dotenv').config();
const GoogleSpreadsheet = require('google-spreadsheet');
const JWT = require('google-auth-library');

const equipmentOperationsTableID = "1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE";
const equipmentOperationsSheetIndex = "0";
const confirmedUsersTableID = "19R0KhK7RvVPKvtmVA7-EGPjakJxfWRflRLHp4Z4FFrs";
const equipmentListTableID = "1DzK7-8XCBOmPmmtTpVOR_kEYh1oVfyQD4sUODwKmQK0";
const equipmentListSheetID = "0";

const serviceAccountAuth = new JWT.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const equipmentOperations = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentOperationsTableID, serviceAccountAuth);
const equipmentList = new GoogleSpreadsheet.GoogleSpreadsheet(equipmentListTableID, serviceAccountAuth);
const confirmedUsers = new GoogleSpreadsheet.GoogleSpreadsheet(confirmedUsersTableID, serviceAccountAuth);

module.exports = {
    equipmentOperationsTableID,
    equipmentListTableID,
    equipmentListSheetID,
    equipmentOperations,
    equipmentList,
    confirmedUsers,
    equipmentOperationsSheetIndex
}