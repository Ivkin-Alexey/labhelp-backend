import { prisma } from '../../../index.js'
import { defaultEquipmentPage, equipmentPageSize, fieldsToSearch, invalidEquipmentCellData } from '../../assets/constants/equipments.js'
import localizations from '../../assets/constants/localizations.js'
import { fetchEquipmentListFromGSheet } from '../../controllers/equipment-controller/g-sheet.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { clearTable } from '../common.js'
import { transformEquipmentInfo, transformEquipmentList } from '../helpers.js'

export async function getEquipmentList(login, isAuthenticated) {
  try {
    let results
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findMany({
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      results = rowData.map(transformEquipmentList)
    } else {
      results = await prisma.Equipment.findMany()
    }

    return results
  } catch (error) {
    const status = error.status || 500
    const errorMsg =
      error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getEquipmentByID(equipmentId, login, isAuthenticated) {
  try {
    let equipment
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findUnique({
        where: {
          id: equipmentId,
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      equipment = transformEquipmentInfo(rowData)
    } else {
      equipment = await prisma.Equipment.findUnique({
        where: {
          id: equipmentId,
        },
      })
    }

    if (!equipment) {
      const msg = `Оборудование с Id ${equipmentId} не найдено в БД (при клике на карточку)`
      throw { message: msg, status: 404 }
    } else {
      return equipment
    }
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера (при клике на карточку): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getEquipmentByIDs(equipmentIds, login, isAuthenticated) {
  try {
    const equipments = await Promise.all(equipmentIds.map(async (equipmentId) => {
      let equipment;
      if (login && isAuthenticated) {
        let rowData = await prisma.Equipment.findUnique({
          where: {
            id: equipmentId,
          },
          include: {
            favoriteEquipment: {
              where: { login },
            },
            operatingEquipment: true,
          },
        });

        equipment = transformEquipmentInfo(rowData);
      } else {
        equipment = await prisma.Equipment.findUnique({
          where: {
            id: equipmentId,
          },
        });
      }

      if (!equipment) {
        const msg = `Оборудование с Id ${equipmentId} не найдено в БД`;
        throw { message: msg, status: 404 };
      } else {
        return equipment;
      }
    }));

    return equipments;
  } catch (error) {
    const status = error.status || 500;
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error;
    throw { message: errorMsg, status };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getEquipmentListByCategory(category, login, isAuthenticated) {
  try {
    let results
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findMany({
        where: {
          category,
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      results = rowData.map(transformEquipmentList)
    } else {
      results = await prisma.Equipment.findMany({
        where: {
          category,
        },
      })
    }

    return results
  } catch (error) {
    const status = error.status || 500
    const errorMsg =
      error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getEquipmentListBySearch(searchTerm, login, isAuthenticated, filters, page = defaultEquipmentPage, pageSize = equipmentPageSize) {
  const whereConditions = searchTerm ? fieldsToSearch.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  })) : [];

  const filterConditions = filters && Object.entries(filters).flatMap(([key, values]) => {
    if (values.length > 0) {
      return {
        [key]: {
          in: values,
        },
      };
    }
    return [];
  }) || [];

  try {
    let baseConditions = whereConditions.length > 0 ? { OR: whereConditions } : {};

    if (filterConditions.length > 0) {
      baseConditions = {
        ...baseConditions,
        AND: filterConditions,
      };
    }

    const skipAmount = (page - 1) * pageSize;

    let results;
    if (login && isAuthenticated) {
      results = await prisma.Equipment.findMany({
        where: baseConditions,
        orderBy: {
          imgUrl: 'desc', // Сортировка по убыванию, а точнее в данном случает по наличию ссылки на изображение
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
        skip: skipAmount,
        take: pageSize,
      });
      results = results.map(transformEquipmentList);
    } else {
      results = await prisma.Equipment.findMany({
        where: baseConditions,
        skip: skipAmount,
        take: pageSize,
      });
    }

    const totalCount = await prisma.Equipment.count({ where: baseConditions });

    return { results, totalCount, page, pageSize };
  } catch (error) {
    const status = error.status || 500;
    const errorMsg =
      error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error;
    throw { message: errorMsg, status };
  }
}


export async function createEquipmentDbFromGSheet() {
  async function transferEquipments(list) {
    const BATCH_SIZE = 10;
    let nonUniqueRecords = [];
    let failedRecords = [];
    let successfulRecordsCount = 0;

    // Шаг 1: Группируем оборудование по модели
    const groupedByModel = {};
    for (const item of list) {
      if (!groupedByModel[item.model]) {
        groupedByModel[item.model] = [];
      }
      groupedByModel[item.model].push(item);
    }

    // Шаг 2: Добавляем поле sameList для каждого элемента в list
    for (const item of list) {
      if (invalidEquipmentCellData.includes(item.model)) {
        continue
      } else {
        const sameModelItems = groupedByModel[item.model]; // Все элементы с той же моделью
        const sameModelIds = sameModelItems.map((i) => i.id); // Получаем их id
        item.sameList = sameModelIds.filter((id) => id !== item.id); // Исключаем текущий id
      }
    }

    // Шаг 3: Вставляем данные в базу
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);

      try {
        const result = await prisma.Equipment.createMany({
          data: batch,
        });
        successfulRecordsCount += result.count;
      } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
          nonUniqueRecords.push(...batch);
        } else {
          failedRecords.push(...batch);
        }
      }
    }

    if (failedRecords.length > 0) {
      sendNotification(`Ошибка при вставке данных в БД: ${failedRecords.length} позиций(я)`);
      console.log(
        'Обработка записей с ошибками. Будет показано не более 10 записей:',
        failedRecords.slice(0, 10),
      );
      failedRecords = [];
    }

    if (nonUniqueRecords.length > 0) {
      sendNotification(
        `Обнаружено оборудование с неуникальным Id (при вставке в БД): ${nonUniqueRecords.length} позиций(я)`,
      );
      console.log(
        'Обработка записей с неуникальным Id. Будет показано не более 10 записей:',
        nonUniqueRecords.slice(0, 10),
      );
      nonUniqueRecords = [];
    }
    const successMsg = `Добавлено записей: ${successfulRecordsCount} из ${list.length}`;
    sendNotification(successMsg);
    console.log(successMsg);
  }

  try {
    await clearTable(prisma.Equipment);
    console.info('База данных оборудования обновляется...');
    const list = await fetchEquipmentListFromGSheet();
    await transferEquipments(list);
    console.info('База данных оборудования обновлена');
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error);
  } finally {
    await prisma.$disconnect();
  }
  return localizations.equipment.dbIsReloadedMsg;
}

