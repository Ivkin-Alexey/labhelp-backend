const {EquipmentItem} = require("../assets/constants/equipments");
const {equipmentOperations, equipmentList, imgUrl, imgColumn, equipmentListSheetID} = require("../assets/constants/gSpreadSheets");
const {StartData} = require("../assets/constants/equipments");
const {readFile, writeFile, writeFileSync} = require("fs");

async function startWorkWithEquipment(chatID = 392584400, accountData, equipment) {
    const {category, id} = equipment;
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

async function endWorkWithEquipment(chatID = 392584400, accountData, equipment) {
    const {category, id} = equipment;
    return new Promise(async (resolve, reject) => {
        try {
            const equipment = await updateEquipmentUsingStatus(category, id, chatID);
            await equipmentOperations.loadInfo();
            let sheet = equipmentOperations.sheetsByIndex[0];
            let rows = await sheet.getRows();
            console.log(rows);
            // rows.forEach((el, i) => {
            //     const equipmentID = rows[i].get("id");
            //     if(equipmentID === id) rows[i].set("endTime", createTime());
            // })
            await sheet.saveUpdatedCells();
            resolve(rows);
        } catch (e) {
            reject(e);
        }
    })
}

async function getCellImageUrl() {
    try {
        await equipmentList.loadInfo();
        let sheet = equipmentList.sheetsById[equipmentListSheetID];
        await sheet.loadCells('E1:E10');
        const cell = sheet.getCellByA1("E10")
        console.log(cell.getUrl())
        return cell.getUrl();
    } catch (e) {
        return e;
    }
}

async function createEquipmentDbFromGSheet() {
    return new Promise((resolve, reject) => {
        fetchEquipmentListFromGSheet().then(list => {
            const listWithCategories = {};
            list.forEach(el => {
                if(listWithCategories[el.category]) listWithCategories[el.category].push(el);
                else {
                    listWithCategories[el.category] = [];
                    listWithCategories[el.category].push(el);
                }
            })
            writeFileSync(equipmentJsonPath, JSON.stringify(listWithCategories, null, 2), error => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve('База данных оборудования обновлена');
            })
        })
    })
}

async function fetchEquipmentListFromGSheet() {
    return new Promise(async (resolve, reject) => {
        try {
            const equipment = [];
            await equipmentList.loadInfo();
            let sheet = equipmentList.sheetsById[equipmentListSheetID];
            const rows = await sheet.getRows();
            for (let i = 10; i < 100; i++) {
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

async function updateEquipmentUsingStatus(equipmentCategory, equipmentID, chatID) {
    return new Promise((resolve, reject) => {
        readFile(equipmentJsonPath, 'utf8', (error, data) => {

            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }

            let parsedData = JSON.parse(Buffer.from(data));
            let index = parsedData[equipmentCategory].findIndex(el => el.id === equipmentID);
            let equipment = parsedData[equipmentCategory][index];
            let {isUsing} = equipment;
            if (isUsing.includes(chatID)) isUsing = isUsing.filter(el => {
                console.log(el, chatID);
                return el !== chatID
            });
            else isUsing.push(chatID);
            parsedData[equipmentCategory][index].isUsing = isUsing;
            writeFile(equipmentJsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(parsedData);
            });
        })
    })
}

async function getEquipmentList() {
    return new Promise((resolve, reject) => {
        readFile(equipmentJsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            resolve(JSON.parse(Buffer.from(data)));
        })
    })
}

module.exports = {
    startWorkWithEquipment,
    endWorkWithEquipment,
    fetchEquipmentListFromGSheet,
    getEquipmentList,
    createEquipmentDbFromGSheet,
    getCellImageUrl
}