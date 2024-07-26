import { readJsonFile, writeJsonFile } from "../fs.js";
import path from "path";
import __dirname from "../../utils/__dirname.js";
import localizations from "../../assets/constants/localizations.js";
const workingEquipmentJsonPath = path.join(
  __dirname,
  "..",
  "assets",
  "db",
  "workingEquipment.json"
);
const favoriteEquipmentsJsonPath = path.join(
  __dirname,
  "..",
  "assets",
  "db",
  "favoriteEquipments.json"
);

export async function updateWorkingEquipmentListInDB(
  equipmentCategory,
  equipmentID,
  chatID,
  action,
  longUse = false
) {
  return new Promise(async (resolve, reject) => {
    try {
      await readJsonFile(workingEquipmentJsonPath).then((parsedData) => {
        if (!parsedData[equipmentCategory] && action === "start")
          parsedData[equipmentCategory] = [];
        const workingEquipmentItem = parsedData[equipmentCategory]?.find(
          (el) => el.equipmentID === equipmentID
        );
        if (!workingEquipmentItem && action === "start") {
          parsedData[equipmentCategory].push(
            new WorkingEquipmentItem(equipmentID, chatID, longUse)
          );
        } else if (workingEquipmentItem && action === "end") {
          parsedData[equipmentCategory] = parsedData[equipmentCategory].filter(
            (el) => el.equipmentID !== equipmentID
          );
          if (parsedData[equipmentCategory].length === 0)
            delete parsedData[equipmentCategory];
        } else {
          reject(
            "Ошибка: action = " +
              action +
              ", workingEquipmentItem = " +
              JSON.stringify(workingEquipmentItem)
          );
        }
        writeJsonFile(workingEquipmentJsonPath, parsedData);
        resolve(parsedData);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function getWorkingEquipmentListFromDB() {
  return new Promise(async (resolve, reject) => {
    try {
      await readJsonFile(workingEquipmentJsonPath).then((parsedData) =>
        resolve(parsedData)
      );
    } catch (e) {
      reject(e);
    }
  });
}

export function getFavoriteEquipmentsFromDB(login) {
  return new Promise(async (resolve, reject) => {
    try {
      await readJsonFile(favoriteEquipmentsJsonPath).then((parsedData) => {
        if (
          !parsedData[login] ||
          !parsedData[login].length === 0
        ) {
          resolve([]);
          return;
        }
        resolve(parsedData[login]);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function removeFavoriteEquipmentFromDB(login, equipmentID) {
  return new Promise(async (resolve, reject) => {
    try {
      await readJsonFile(favoriteEquipmentsJsonPath)
        .then((parsedData) => {
          if (
            !parsedData[login] ||
            !parsedData[login].find((el) => el === equipmentID)
          ) {
            reject(localizations.equipment.favorite.errors.notExist);
            return;
          }
          parsedData[login] = parsedData[login].filter(
            (el) => el !== equipmentID
          );
          if (parsedData[login].length === 0) delete parsedData[login];
          return parsedData;
        })
        .then((updatedParsedData) =>
          writeJsonFile(favoriteEquipmentsJsonPath, updatedParsedData)
        )
        .then(() => resolve(localizations.equipment.favorite.deletedFromDB));
    } catch (e) {
      reject(e);
    }
  });
}

export function addFavoriteEquipmentToDB(login, equipmentID) {
  return new Promise(async (resolve, reject) => {
    try {
      await readJsonFile(favoriteEquipmentsJsonPath)
        .then((parsedData) => {
          if (!parsedData[login]) parsedData[login] = [];
          if (parsedData[login].includes(equipmentID)) {
            reject(localizations.equipment.favorite.errors.notUnique);
            return;
          }
          parsedData[login].push(equipmentID);
          return parsedData;
        })
        .then((updatedParsedData) => {
          writeJsonFile(favoriteEquipmentsJsonPath, updatedParsedData);
        })
        .then(() => resolve(localizations.equipment.favorite.addedToDB));
    } catch (e) {
      reject(e);
    }
  });
}
