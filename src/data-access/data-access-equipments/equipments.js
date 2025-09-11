import { isBuffer } from 'util'
import { prisma } from '../../../index.js'
import {
  defaultEquipmentPage,
  equipmentPageSize,
  fieldsToSearch,
  searchConfig,
} from '../../assets/constants/equipments.js'
import localizations from '../../assets/constants/localizations.js'
import { fetchEquipmentListFromGSheet } from '../../controllers/equipment-controller/g-sheet.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { clearTable } from '../common.js'
import { transformEquipmentInfo, transformEquipmentList } from '../helpers.js'
import { isIdDataValid } from '../../controllers/equipment-controller/helpers.js'

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
        orderBy: {
          imgUrl: 'desc', // Сортировка по убыванию, а точнее в данном случает по наличию ссылки на изображение
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
    let equipment = await prisma.Equipment.findUnique({
      where: {
        id: equipmentId,
      },
      include: {
        model: true,
        department: true,
        ...(login && isAuthenticated ? {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        } : {})
      },
    })
    equipment = transformEquipmentInfo(equipment)

    if (!equipment) {
      const msg = `Оборудование с Id ${equipmentId} не найдено в БД (при клике на карточку)`
      throw { message: msg, status: 404 }
    } else {
      const res = await prisma.Equipment.findMany({
        where: {
          modelId: equipment.modelId,
          departmentId: equipment.departmentId,
        },
      });
      return { ...equipment, count: res.length, sameList: res.map(x => x.id) }
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
        const msg = `Оборудование с Id ${equipmentId} не найдено в БД`
        throw { message: msg, status: 404 }
      } else {
        return equipment
      }
    }))

    return equipments
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
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
        orderBy: {
          imgUrl: 'desc', // Сортировка по убыванию, а точнее в данном случает по наличию ссылки на изображение
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
  
  try {
    const uniqueConditions = searchTerm ? {
      OR: searchConfig.map(config => {
        if (config.relation) {
          return {
            [config.relation]: {
              [config.field]: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          };
        } else {
          return {
            [config.field]: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          };
        }
      })
    } : {};

    const filterConditions = filters && Object.entries(filters).flatMap(([key, values]) => {
      if (values.length > 0) {
        // Специальная обработка для фильтра по подразделению
        if (key === 'department') {
          return {
            department: {
              name: { in: values }
            }
          };
        }
        return { [key]: { in: values } };
      }
      return [];
    }) || [];

    const baseConditions = {
      ...(Object.keys(uniqueConditions).length > 0 ? uniqueConditions : {}),
      ...(filterConditions.length > 0 ? { AND: filterConditions } : {})
    };

    // 1) Группировка по modelId + departmentId (кол-во внутри подразделения)
    const groupedByModelAndDept = await prisma.equipment.groupBy({
      by: ['modelId', 'departmentId'],
      where: baseConditions,
      _count: { _all: true },
      // Можно сортировать по количеству, либо по ключам группы
      orderBy: [{ modelId: 'asc' }, { departmentId: 'asc' }]
    });

    // 2) Группировка по modelId (общее количество по модели)
    const totalsByModel = await prisma.equipment.groupBy({
      by: ['modelId'],
      where: baseConditions,
      _count: { _all: true },
      orderBy: [{ modelId: 'asc' }]
    });
    const modelIdToTotal = new Map(totalsByModel.map(x => [x.modelId, x._count._all]));

    // 3) Пагинация на уровне сгруппированных записей
    const totalCount = groupedByModelAndDept.length;
    const skipAmount = (page - 1) * pageSize;
    const pageGroups = groupedByModelAndDept.slice(skipAmount, skipAmount + pageSize);

    // 4) Для каждой группы берём один «репрезентативный» экземпляр для обогащения связями
    const enriched = await Promise.all(pageGroups.map(async g => {
      const representative = await prisma.equipment.findFirst({
        where: { modelId: g.modelId, departmentId: g.departmentId, ...(baseConditions || {}) },
        include: {
          model: true,
          department: true,
          ...(login && isAuthenticated ? {
            favoriteEquipment: { where: { login } },
            operatingEquipment: true,
          } : {})
        },
        // Выбираем запись с картинкой приоритетно
        orderBy: [{ imgUrl: 'desc' }]
      });

      if (!representative) {
        return null;
      }

      return transformEquipmentList({
        ...representative,
        quantity: g._count._all,
        totalQuantity: modelIdToTotal.get(g.modelId) || g._count._all,
      });
    }));

    const results = enriched.filter(Boolean);

    return { results, totalCount, page, pageSize };
  } catch (error) {
    console.error('Search error:', error);
    const status = error.status || 500;
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error;
    throw { message: errorMsg, status };
  }
}

export async function createEquipmentDbFromGSheet(botLogs = true) {
  async function transferEquipments(list) {
    const BATCH_SIZE = 10
    let nonUniqueRecords = []
    let failedRecords = []
    let successfulRecordsCount = 0
    const data = {
      model: [],
      department: [],
    }

    try {
      console.log('Create departments')
      const departments = list.reduce((acc, x) => {
        const trimmed = x.department?.trim()

        if (isIdDataValid(trimmed)) {
          acc.add(trimmed)
        }

        return acc
      }, new Set())
      data.department = [...departments].map((x, i) => ({ id: i + 1, name: x }))
      const { count } = await prisma.Department.createMany({
        skipDuplicates: true,
        data: data.department,
      })
      console.log('Departments created ', count)
    } catch (e) {
      console.error('Failed to create departments ', e)
    }

    try {
      console.log('Create models')
      const models = list.reduce((acc, x) => {
        const trimmed = x.model && x.model.trim()

        if (isIdDataValid(trimmed)) {
          acc.add(trimmed)
        }

        return acc
      }, new Set())
      data.model = [...models].map((x, i) => ({ id: i + 1, name: x }))
      const { count } = await prisma.Model.createMany({
        skipDuplicates: true,
        data: data.model,
      })
      console.log('Models created ', count)
    } catch (e) {
      console.error('Failed to create models ', e)
    }

    const updatedList = list.filter(x => isIdDataValid(x.model.trim()) && isIdDataValid(x.department.trim())).map(x => Object.entries(x).reduce((acc, [k, v]) => {
      const trimmed = v.trim()

      if (k === 'model' || k === 'department') {
        acc[k] = {
          connect: {
            id: data[k].find(x => x.name === trimmed).id,
          },
        }
        return acc
      }

      acc[k] = trimmed
      return acc
    }, {}))

    // Шаг 1: Группируем оборудование по модели
    // const groupedByModel = {};
    // for (const item of list) {
    //   const model = item.model.trim();
    //
    //   // Если модель не указана, то такую единицу оборудования в БД не включаем
    //   if (invalidEquipmentCellData.includes(model)) {
    //     continue;
    //   }
    //
    //   if (!groupedByModel[model]) {
    //     groupedByModel[model] = {
    //       ...item,
    //       sameList: [item.id],
    //       departments: new Set([item.department])
    //     };
    //   } else {
    //     groupedByModel[model].sameList.push(item.id);
    //     groupedByModel[model].departments.add(item.department);
    //   }
    // }

    // В итоге мы имеем объект, где ключ - это модель, а значение это единица оборудования

    // Шаг 2: Создаем записи для каждого подразделения
    // for (const key in groupedByModel) {
    //   const equipment = groupedByModel[key];
    //
    //   // Удаляем временное поле departments
    //   const { departments, ...equipmentData } = equipment;
    //
    //   if (departments.size > 0) {
    //     departments.forEach(department => {
    //       updatedList.push({
    //         ...equipmentData,
    //         department
    //       });
    //     });
    //   } else {
    //     updatedList.push(equipmentData);
    //   }
    // }

    // Шаг 3: Вставляем данные в базу
    for (let i = 0; i < updatedList.length; i += BATCH_SIZE) {
      const batch = updatedList.slice(i, i + BATCH_SIZE)

      try {
        const result = await prisma.$transaction(batch.map(x => prisma.Equipment.create({
          data: x,
        })))
        successfulRecordsCount += result.count
      } catch (error) {
        console.log(error)
        if (error.code === 'P2002') {
          nonUniqueRecords.push(...batch)
        } else {
          failedRecords.push(...batch)
        }
      }
    }

    // Обработка ошибок и уведомления
    if (failedRecords.length > 0) {
      botLogs && sendNotification(`Ошибка при вставке данных в БД: ${failedRecords.length} позиций(я)`)
      console.log(
        'Обработка записей с ошибками. Будет показано не более 10 записей:',
        failedRecords.slice(0, 10),
      )
    }

    if (nonUniqueRecords.length > 0) {
      botLogs && sendNotification(
        `Обнаружено оборудование с неуникальным Id: ${nonUniqueRecords.length} позиций(я)`,
      )
      console.log(
        'Обработка записей с неуникальным Id. Будет показано не более 10 записей:',
        nonUniqueRecords.slice(0, 10),
      )
    }

    const successMsg = `Добавлено записей: ${successfulRecordsCount} из ${list.length}`
    botLogs && sendNotification(successMsg)
    console.log(successMsg)
  }

  try {
    await clearTable(prisma.Equipment)
    await clearTable(prisma.Department)
    await clearTable(prisma.Model)
    console.info('База данных оборудования обновляется...')
    const list = await fetchEquipmentListFromGSheet()
    await transferEquipments(list)
    console.info('База данных оборудования обновлена')
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error)
    throw error // Пробрасываем ошибку выше для обработки
  } finally {
    await prisma.$disconnect()
  }

  return localizations.equipment.dbIsReloadedMsg
}

