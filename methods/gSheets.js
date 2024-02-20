const {equipmentOperations} = require("../assets/constants/gSpreadSheets");
const {StartData} = require("../assets/constants/equipments");

async function updateRowInGSheet() {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedEquipmentList = await updateEquipmentUsingStatus(category, id, chatID);
            await equipmentOperations.loadInfo();
            let sheet = equipmentOperations.sheetsByIndex[0];
            const data = new StartData(chatID, accountData, equipment);
            await sheet.addRow(data);
            await sheet.saveUpdatedCells();
            resolve(updatedEquipmentList);
        } catch (e) {
            reject(e);
        }
    })
}