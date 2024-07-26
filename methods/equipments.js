import {
  EquipmentItem,
  WorkingEquipmentItem,
  EndData,
} from "../assets/constants/equipments.js";
import * as fs from "node:fs/promises";
import request from "request";
import {
  equipmentOperations,
  equipmentList,
  equipmentListSheetID,
  equipmentOperationsTableID,
  equipmentOperationsSheetIndex,
} from "../assets/constants/gSpreadSheets.js";
import { StartData } from "../assets/constants/equipments.js";
import { readFile, writeFile, writeFileSync } from "fs";
import path from "path";
import { getUserData } from "./users.js";
import { createDate, createTime, checkEquipmentID } from "./helpers.js";
import { amountOfEquipment } from "../assets/constants/equipments.js";
import { personRoles } from "../assets/constants/users.js";
import localizations from "../assets/constants/localizations.js";
import { updateDataInGSheetCell, addNewRowInGSheet } from "./gSheets.js";
import { readJsonFile, writeJsonFile } from "./fs.js";
import {
  updateWorkingEquipmentListInDB,
  getWorkingEquipmentListFromDB,
} from "./db/equipment.js";
import __dirname from "../utils/__dirname.js";
const equipmentJsonPath = path.join(
  __dirname,
  "..",
  "assets",
  "db",
  "equipment.json"
);
const imagesPath = path.join(__dirname, "..", "assets", "images", "equipments");

async function startWorkWithEquipment(chatID, accountData, equipment) {
  const { category, id } = equipment;
  return new Promise(async (resolve, reject) => {
    try {
      await updateWorkingEquipmentListInDB(category, id, chatID, "start");
      const data = new StartData(chatID, accountData, equipment);
      await addNewRowInGSheet(
        equipmentOperations,
        equipmentOperationsSheetIndex,
        data
      );
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
}

async function endWorkWithEquipment(chatID, accountData, equipment) {
  const { category, id } = equipment;
  return new Promise(async (resolve, reject) => {
    try {
      const workingEquipmentList = await getWorkingEquipmentListFromDB();
      const equipment = workingEquipmentList[category]?.find(
        (el) => (el.equipmentID = id)
      );
      if (equipment) {
        await updateWorkingEquipmentListInDB(category, id, chatID, "end");
        const data = new EndData();
        await updateDataInGSheetCell(
          equipmentOperations,
          equipmentOperationsSheetIndex,
          equipment,
          "endTime",
          data.endTime
        );
        resolve(data);
      } else {
        reject("Такого оборудования нет в списке работающего");
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function reloadEquipmentDB(bot, chatID) {
  const userData = await getUserData(chatID);

  if (userData.role === personRoles.superAdmin) {
    await bot.sendMessage(chatID, localizations.equipment.dbIsReloading);
    await createEquipmentDbFromGSheet()
      .then((r) => bot.sendMessage(chatID, r))
      .catch((err) => bot.sendMessage(chatID, err));
  } else {
    await bot.sendMessage(chatID, localizations.users.errors.userAccessError);
  }
}

async function createEquipmentDbFromGSheet() {
  return new Promise((resolve, reject) => {
    fetchEquipmentListFromGSheet().then(async (list) => {
      const listWithCategories = {};
      list.forEach((el) => {
        if (listWithCategories[el.category])
          listWithCategories[el.category].push(el);
        else {
          listWithCategories[el.category] = [];
          listWithCategories[el.category].push(el);
        }
      });
      await writeFileSync(
        equipmentJsonPath,
        JSON.stringify(listWithCategories, null, 2),
        (error) => {
          if (error) {
            reject(
              `Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`
            );
          }
        }
      );
      resolve(localizations.equipment.dbIsReloadedMsg);
    });
  });
}

async function fetchEquipmentListFromGSheet() {
  return new Promise(async (resolve, reject) => {
    try {
      const equipment = [];
      await equipmentList.loadInfo();
      let sheet = equipmentList.sheetsById[equipmentListSheetID];
      const rows = await sheet.getRows();
      for (let i = 0; i < amountOfEquipment; i++) {
        const newEquipmentItem = new EquipmentItem();
        newEquipmentItem.name = rows[i].get("Наименование оборудования") || "";
        newEquipmentItem.description =
          rows[i].get("Область применения оборудования") || "";
        newEquipmentItem.brand = rows[i].get("Изготовитель") || "";
        newEquipmentItem.model = rows[i].get("Модель") || "";
        newEquipmentItem.category = rows[i].get("Категория") || "";
        newEquipmentItem.filesUrl =
          rows[i].get(
            "Эксплуатационно-техническая документация\n" +
              "(ссылка на облако)\n" +
              "\n" +
              "Паспорт/руководство по эксплуатации"
          ) || "";
        newEquipmentItem.imgUrl = rows[i].get("Ссылки на фотографии") || "";

        const id = rows[i].get("Заводской номер");
        if (checkEquipmentID(id)) newEquipmentItem.id = id;
        else continue;

        equipment.push(newEquipmentItem);
      }
      resolve(equipment);
    } catch (e) {
      reject(e);
    }
  });
}

async function updateEquipmentUsingStatus(
  equipmentCategory,
  equipmentID,
  chatID
) {
  return new Promise((resolve, reject) => {
    readFile(workingEquipmentJsonPath, "utf8", (error, data) => {
      if (error) {
        reject(
          `Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`
        );
        return;
      }

      let parsedData = JSON.parse(Buffer.from(data));
      let index = parsedData[equipmentCategory].findIndex(
        (el) => el.id === equipmentID
      );
      let equipment = parsedData[equipmentCategory][index];
      let { isUsing } = equipment;
      if (isUsing.includes(chatID))
        isUsing = isUsing.filter((el) => {
          return el !== chatID;
        });
      else isUsing.push(chatID);
      parsedData[equipmentCategory][index].isUsing = isUsing;
      writeFile(
        equipmentJsonPath,
        JSON.stringify(parsedData, null, 2),
        (error) => {
          if (error) {
            reject(
              `Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`
            );
            return;
          }
          resolve(parsedData);
        }
      );
    });
  });
}

async function getEquipmentList() {
  return new Promise((resolve, reject) => {
    readFile(equipmentJsonPath, "utf8", (error, data) => {
      if (error) {
        reject(
          `Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`
        );
        return;
      }
      const parsedData = JSON.parse(Buffer.from(data));
      resolve(parsedData);
    });
  });
}

async function getEquipmentListByCategory(category) {
  try {
    const list = await getEquipmentList();
    return list[category];
  } catch (e) {
    return e;
  }
}

async function getEquipmentListBySearch(search) {
  try {
    const list = await getEquipmentList();
    return list[search];
  } catch (e) {
    return e;
  }
}

async function getEquipment(equipmentID) {
  return new Promise((resolve, reject) => {
    readFile(equipmentJsonPath, "utf8", (error, data) => {
      if (error) {
        reject(
          `Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`
        );
        return;
      }

      const parsedData = JSON.parse(Buffer.from(data));

      const equipmentData = findEquipment(parsedData, equipmentID);

      if (equipmentData) resolve(equipmentData);
      else reject(localizations.equipment.searchError);
    });
  });
}

function findEquipment(object, equipmentID) {
  let equipmentData;

  for (const key in object) {
    const arr = object[key];
    equipmentData = arr.find((el) => el.id === equipmentID);
    if (equipmentData) {
      return equipmentData;
    }
  }
}

export {
  startWorkWithEquipment,
  endWorkWithEquipment,
  getEquipmentList,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
  createEquipmentDbFromGSheet,
  reloadEquipmentDB,
  getEquipment,
};
