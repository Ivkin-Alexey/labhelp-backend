import {readJsonFile, writeJsonFile} from "../fs.js";
import path from "path";
const workingEquipmentJsonPath = path.join(__dirname, '..', '..', 'assets', 'db', 'workingEquipment.json');

async function updateWorkingEquipmentListInDB(equipmentCategory, equipmentID, chatID, action, longUse = false) {
    return new Promise(async (resolve, reject) => {
        try {

            await readJsonFile(workingEquipmentJsonPath)
                .then(parsedData => {
                    if (!parsedData[equipmentCategory] && action === "start") parsedData[equipmentCategory] = [];
                    const workingEquipmentItem = parsedData[equipmentCategory]?.find(el => el.equipmentID === equipmentID);
                    if (!workingEquipmentItem && action === "start") {
                        parsedData[equipmentCategory].push(new WorkingEquipmentItem(equipmentID, chatID, longUse));
                    } else if (workingEquipmentItem && action === "end") {
                        parsedData[equipmentCategory] = parsedData[equipmentCategory].filter(el => el.equipmentID !== equipmentID);
                        if(parsedData[equipmentCategory].length === 0) delete parsedData[equipmentCategory];
                    } else {
                        reject("Ошибка: action = " + action + ", workingEquipmentItem = " + JSON.stringify(workingEquipmentItem));
                    }
                    writeJsonFile(workingEquipmentJsonPath, parsedData);
                    resolve(parsedData);
                })
        } catch (e) {
            reject(e);
        }
    });
}

async function getWorkingEquipmentListFromDB() {
    return new Promise(async (resolve, reject) => {
        try {
            await readJsonFile(workingEquipmentJsonPath)
                .then(parsedData => resolve(parsedData))
        } catch (e) {
            reject(e);
        }
    });
}

export {updateWorkingEquipmentListInDB, getWorkingEquipmentListFromDB};