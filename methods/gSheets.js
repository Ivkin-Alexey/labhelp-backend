const {equipmentOperations} = require("../assets/constants/gSpreadSheets");
const {createDate, createTime} = require("./helpers");

async function addNewRowInGSheet(table, sheetIndex, data) {
    return new Promise(async (resolve, reject) => {
        try {
            await table.loadInfo();
            let sheet = table.sheetsByIndex[sheetIndex];
            await sheet.addRow(data);
            await sheet.saveUpdatedCells();
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

async function updateDataInGSheetCell(table, sheetIndex, dataForSearching, columnName, value) {
    return new Promise(async (resolve, reject) => {
        try {
            await table.loadInfo();
            let sheet = table.sheetsByIndex[sheetIndex];
            const rows = await sheet.getRows();
            let ended = false;

            for (let i = 2; i < rows.length; i++) {
                if (ended) break;
                const cellValue = rows[i].get(columnName);
                if (cellValue === "") {
                    const rowData = rows[i]._rawData.join("");
                    console.log(rowData);
                    if (rowData.includes(dataForSearching.equipmentID) && rowData.includes(createDate())) {
                        ended = true;
                        rows[i].set(columnName, value);
                        await rows[i].save();
                    }
                }
            }

            await sheet.saveUpdatedCells();
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {addNewRowInGSheet, updateDataInGSheetCell};