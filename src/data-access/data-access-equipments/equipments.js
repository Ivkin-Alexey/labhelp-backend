import { isBuffer } from 'util'
import { prisma } from '../../../index.js'
import {
  defaultEquipmentPage,
  equipmentPageSize,
  fieldsToSearch,
  searchConfig,
  filterFieldsConfig,
  invalidEquipmentCellData,
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
      // @ts-ignore
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
        // @ts-ignore
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
    // @ts-ignore
    let equipment = await prisma.Equipment.findUnique({
      where: {
        id: equipmentId,
      },
      include: {
        model: true,
        department: true,
        classification: true,
        measurements: true,
        type: true,
        kind: true,
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
      // @ts-ignore
      const res = await prisma.Equipment.findMany({
        where: {
          model: {
            name: equipment.model
          },
          department: {
            name: equipment.department
          }
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
        // @ts-ignore
        let rowData = await prisma.Equipment.findUnique({
          where: {
            id: equipmentId,
          },
          include: {
            model: true,
            department: true,
            classification: true,
            measurements: true,
            type: true,
            kind: true,
            favoriteEquipment: {
              where: { login },
            },
            operatingEquipment: true,
          },
        })

        equipment = transformEquipmentInfo(rowData)
      } else {
        // @ts-ignore
        let rowData = await prisma.Equipment.findUnique({
          where: {
            id: equipmentId,
          },
          include: {
            model: true,
            department: true,
            classification: true,
            measurements: true,
            type: true,
            kind: true,
          },
        })
        
        equipment = transformEquipmentInfo(rowData)
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
      // @ts-ignore
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
      // @ts-ignore
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
        // Специальная обработка для фильтра по типу оборудования
        if (key === 'type') {
          return {
            type: {
              name: { in: values }
            }
          };
        }
        // Специальная обработка для фильтра по классификации
        if (key === 'classification') {
          return {
            classification: {
              name: { in: values }
            }
          };
        }
        // Специальная обработка для фильтра по измерениям
        if (key === 'measurements') {
          return {
            measurements: {
              name: { in: values }
            }
          };
        }
        // Специальная обработка для фильтра по виду оборудования
        if (key === 'kind') {
          return {
            kind: {
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
    console.error('Ошибка поиска:', error);
    const status = error.status || 500;
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error;
    throw { message: errorMsg, status };
  }
}

export async function createEquipmentDbFromGSheet(botLogs = true) {
  async function createAllTablesAndFilters(list) {
    
    // Собираем уникальные значения для всех таблиц
    const tableData = {}
    
    // Departments
    const departments = list.reduce((acc, x) => {
      const trimmed = x.department?.trim()
      if (isIdDataValid(trimmed)) {
        acc.add(trimmed)
      }
      return acc
    }, new Set())
    tableData.department = [...departments].map((x, i) => ({ id: i + 1, name: x }))
    
    // Models
    const models = list.reduce((acc, x) => {
      const trimmed = x.model && x.model.trim()
      if (isIdDataValid(trimmed)) {
        acc.add(trimmed)
      }
      return acc
    }, new Set())
    tableData.model = [...models].map((x, i) => ({ id: i + 1, name: x }))
    
    // Собираем данные для фильтров (исключаем department и model, так как они уже обработаны)
    filterFieldsConfig.forEach(config => {
      if (config.field === 'department' || config.field === 'model') {
        return // Пропускаем department и model, так как они уже обработаны выше
      }
      const values = new Set()
      list.forEach(equipment => {
        const value = equipment[config.field]
        if (value && value.trim()) {
          values.add(value.trim())
        }
      })
      tableData[config.field] = Array.from(values).sort()
    })
    
    // Создаем все таблицы параллельно
    const promises = []
    
    // Departments
    promises.push(
      // @ts-ignore
      prisma.Department.createMany({
        skipDuplicates: true,
        data: tableData.department,
      }).then(result => console.log(`Таблица Department обновлена`))
    )
    
    // Models
    promises.push(
      // @ts-ignore
      prisma.Model.createMany({
        skipDuplicates: true,
        data: tableData.model,
      }).then(result => console.log(`Таблица Model обновлена`))
    )
    
    // Filter tables (исключаем department и model, так как они уже созданы через createMany)
    filterFieldsConfig.forEach(config => {
      if (config.field === 'department' || config.field === 'model') {
        return // Пропускаем department и model, так как они уже созданы выше
      }
      const values = tableData[config.field]
      if (values.length > 0) {
        promises.push(
          Promise.all(
            values.map(name => 
              prisma[config.tableName].upsert({
                where: { name },
                update: {},
                create: { name }
              })
            )
          ).then(() => console.log(`Таблица ${config.tableName} обновлена`))
        )
      }
    })
    
    await Promise.all(promises)
    console.log('Все таблицы и фильтры успешно обновлены')
  }


  try {
    // Очищаем все таблицы
    // @ts-ignore
    await clearTable(prisma.Equipment)
    // @ts-ignore
    await clearTable(prisma.Department)
    // @ts-ignore
    await clearTable(prisma.Model)
    // @ts-ignore
    await clearTable(prisma.Classification)
    // @ts-ignore
    await clearTable(prisma.Measurement)
    // @ts-ignore
    await clearTable(prisma.EquipmentType)
    // @ts-ignore
    await clearTable(prisma.EquipmentKind)
    
    console.info('База данных оборудования обновляется...')
    const list = await fetchEquipmentListFromGSheet()
    
    // Создаем все таблицы и фильтры в одном процессе
    await createAllTablesAndFilters(list)
    
    // Создаем оборудование с правильными связями
    await createEquipmentWithRelations(list)
    
    console.info('✅ База данных оборудования обновлена')
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error)
    throw error // Пробрасываем ошибку выше для обработки
  } finally {
    await prisma.$disconnect()
  }

  return localizations.equipment.dbIsReloadedMsg
}

// Динамическое получение фильтров из БД (оптимизированная версия)
export async function getEquipmentFilters() {
  try {
    // Создаем массив запросов на основе конфигурации фильтров
    const prismaQueries = filterFieldsConfig.map(config => {
      return prisma[config.tableName].findMany({ 
        select: { id: true, name: true },
        orderBy: { name: 'asc' } 
      })
    })

    // Получаем все данные за один запрос
    const results = await Promise.all(prismaQueries)

    // Создаем массив данных для удобного доступа
    const dataMap = {}
    filterFieldsConfig.forEach((config, index) => {
      dataMap[config.field] = results[index]
    })

    // Создаем массив фильтров в цикле
    const filters = filterFieldsConfig.map(config => ({
      name: config.field,
      label: config.label,
      options: dataMap[config.field]
        .map(item => item.name)
        .filter(name => !invalidEquipmentCellData.includes(name))
    }))
    
    return filters
  } catch (error) {
    console.error('Ошибка получения фильтров оборудования:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Создание оборудования с правильными связями (упрощенная версия)
async function createEquipmentWithRelations(equipmentList) {
  try {
    console.log('Создание оборудования со связями...')
    
    // Создаем массив запросов на основе конфигурации фильтров + базовые таблицы
    const prismaQueries = [
      prisma.model.findMany({ select: { id: true, name: true } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      ...filterFieldsConfig.map(config => 
        prisma[config.tableName].findMany({ select: { id: true, name: true } })
      )
    ]

    // Получаем все данные за один запрос
    const results = await Promise.all(prismaQueries)
    
    // Извлекаем базовые таблицы
    const [models, departments] = results
    
    // Создаем объект с данными фильтров
    const filterData = {}
    filterFieldsConfig.forEach((config, index) => {
      filterData[config.field] = results[index + 2] // +2 потому что первые два - это models и departments
    })

    // Создаем мапы для быстрого поиска
    const modelMap = new Map(models.map(m => [m.name, m.id]))
    const departmentMap = new Map(departments.map(d => [d.name, d.id]))
    
    const filterMaps = {}
    filterFieldsConfig.forEach(config => {
      filterMaps[config.field] = new Map(
        filterData[config.field].map(item => [item.name, item.id])
      )
    })

    // Фильтруем и обрабатываем оборудование
    const validEquipment = equipmentList.filter(x => 
      isIdDataValid(x.model?.trim()) && 
      isIdDataValid(x.department?.trim())
    )

    const BATCH_SIZE = 10
    let successfulRecordsCount = 0

    for (let i = 0; i < validEquipment.length; i += BATCH_SIZE) {
      const batch = validEquipment.slice(i, i + BATCH_SIZE)
      
      const processedBatch = batch.map(equipment => {
        const processedData = { ...equipment }

        // Обрабатываем связи
        if (equipment.model) {
          const modelId = modelMap.get(equipment.model.trim())
          if (modelId) {
            processedData.modelId = modelId
            delete processedData.model
          }
        }

        if (equipment.department) {
          const departmentId = departmentMap.get(equipment.department.trim())
          if (departmentId) {
            processedData.departmentId = departmentId
            delete processedData.department
          }
        }

        // Обрабатываем фильтры
        filterFieldsConfig.forEach(config => {
          const value = equipment[config.field]
          if (value && value.trim()) {
            const id = filterMaps[config.field].get(value.trim())
            if (id) {
              // Исправляем название поля для measurements
              const fieldId = config.field === 'measurements' ? 'measurementId' : `${config.field}Id`
              processedData[fieldId] = id
            }
          }
          delete processedData[config.field]
        })

        return processedData
      })

      try {
        await prisma.$transaction(
          processedBatch.map(data => prisma.equipment.create({ data }))
        )
        successfulRecordsCount += processedBatch.length
      } catch (error) {
        console.error('Ошибка создания пакета оборудования:', error)
      }
    }

    console.log(`Создано ${successfulRecordsCount} записей оборудования со связями`)
    
  } catch (error) {
    console.error('Ошибка создания оборудования со связями:', error)
    throw error
  }
}

