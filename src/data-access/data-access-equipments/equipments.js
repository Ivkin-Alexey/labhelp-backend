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
import { EXPECTED_TRGM_INDEXES_COUNT } from '../../assets/constants/database.js'
import localizations from '../../assets/constants/localizations.js'
import { fetchEquipmentListFromGSheet } from '../../controllers/equipment-controller/g-sheet.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { clearTable } from '../common.js'
import { transformEquipmentInfo, transformEquipmentList } from '../helpers.js'
import { isIdDataValid } from '../../controllers/equipment-controller/helpers.js'
import { handleDatabaseConnectionError } from '../../utils/dbConnectionHandler.js'
import { notifyAdmins } from '../../services/telegram-notifier.js'

function isPrismaConnectionError(error) {
  return error?.code?.startsWith('P100') || error?.errorCode?.startsWith('P100') || 
         (error?.message && error.message.includes("Can't reach database server"))
}

/**
 * Устанавливает расширение pg_trgm если оно еще не установлено
 * @returns {Promise<{version: string}>} Информация об установленном расширении
 * @throws {Error} Если расширение не удалось установить или проверить
 */
async function ensurePgTrgmExtension() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
  
  // Проверяем, что расширение действительно установлено
  const extensionCheck = await prisma.$queryRawUnsafe(`
    SELECT extname, extversion 
    FROM pg_extension 
    WHERE extname = 'pg_trgm';
  `)
  
  if (!Array.isArray(extensionCheck) || extensionCheck.length === 0) {
    throw new Error('Не удалось установить расширение pg_trgm. Возможно, требуется права superuser.')
  }
  
  const version = extensionCheck[0]?.extversion || 'неизвестна'
  console.info(`✅ Расширение pg_trgm установлено (версия: ${version})`)
  return { version }
}

/**
 * Преобразует значение COUNT из PostgreSQL в число
 * Prisma может вернуть BigInt, Number или строку в зависимости от версии
 * @param {bigint|number|string} value - Значение COUNT из запроса
 * @returns {number} Числовое значение
 */
function parsePostgresCount(value) {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Создает триграммные индексы для оптимизации ILIKE поиска
 * @returns {Promise<{createdCount: number, failedCount: number, actualCount: number}>}
 * @throws {Error} Если произошла критическая ошибка
 */
export async function createTrgmIndexes() {
  try {
    console.info('Создание триграммных индексов для оптимизации поиска...')
    
    // Устанавливаем расширение pg_trgm
    await ensurePgTrgmExtension()
    
    // Создаем индексы с IF NOT EXISTS для безопасности (как в SQL скрипте)
    // Используем IF NOT EXISTS чтобы не пересоздавать существующие индексы
    const indexesToCreate = [
      { name: 'idx_equipment_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_name_trgm ON "Equipment" USING gin(name gin_trgm_ops)`, table: 'Equipment', column: 'name' },
      { name: 'idx_equipment_description_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_description_trgm ON "Equipment" USING gin(description gin_trgm_ops)`, table: 'Equipment', column: 'description' },
      { name: 'idx_equipment_brand_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_brand_trgm ON "Equipment" USING gin(brand gin_trgm_ops)`, table: 'Equipment', column: 'brand' },
      { name: 'idx_equipment_serial_number_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_serial_number_trgm ON "Equipment" USING gin("serialNumber" gin_trgm_ops)`, table: 'Equipment', column: 'serialNumber' },
      { name: 'idx_equipment_inventory_number_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_inventory_number_trgm ON "Equipment" USING gin("inventoryNumber" gin_trgm_ops)`, table: 'Equipment', column: 'inventoryNumber' },
      { name: 'idx_equipment_category_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_category_trgm ON "Equipment" USING gin(category gin_trgm_ops)`, table: 'Equipment', column: 'category' },
      { name: 'idx_model_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_model_name_trgm ON "Model" USING gin(name gin_trgm_ops)`, table: 'Model', column: 'name' },
      { name: 'idx_department_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_department_name_trgm ON "Department" USING gin(name gin_trgm_ops)`, table: 'Department', column: 'name' },
      { name: 'idx_classification_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_classification_name_trgm ON "Classification" USING gin(name gin_trgm_ops)`, table: 'Classification', column: 'name' },
      { name: 'idx_measurement_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_measurement_name_trgm ON "Measurement" USING gin(name gin_trgm_ops)`, table: 'Measurement', column: 'name' },
      { name: 'idx_equipment_type_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_type_name_trgm ON "EquipmentType" USING gin(name gin_trgm_ops)`, table: 'EquipmentType', column: 'name' },
      { name: 'idx_equipment_kind_name_trgm', sql: `CREATE INDEX IF NOT EXISTS idx_equipment_kind_name_trgm ON "EquipmentKind" USING gin(name gin_trgm_ops)`, table: 'EquipmentKind', column: 'name' },
    ]
    
    let createdCount = 0
    let failedCount = 0
    const failedIndexes = []
    
    for (const index of indexesToCreate) {
      try {
        await prisma.$executeRawUnsafe(index.sql)
        createdCount++
        console.info(`  ✓ Индекс ${index.name} создан/проверен`)
      } catch (error) {
        failedCount++
        const errorMessage = error?.message || String(error)
        failedIndexes.push({ name: index.name, error: errorMessage })
        console.error(`  ✗ Не удалось создать индекс ${index.name} (${index.table}.${index.column}): ${errorMessage}`)
      }
    }
    
    // Проверяем, что индексы действительно созданы
    const indexCheck = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE '%_trgm%';
    `)
    
    const actualCount = parsePostgresCount(indexCheck?.[0]?.count)
    
    console.info(`✅ Попытка создания завершена: ${createdCount} из ${indexesToCreate.length}`)
    console.info(`🔍 Фактически найдено триграммных индексов в БД: ${actualCount}`)
    
    if (failedCount > 0) {
      console.warn(`⚠️ Не удалось создать ${failedCount} индексов:`)
      failedIndexes.forEach(failed => {
        console.warn(`   - ${failed.name}: ${failed.error}`)
      })
    }
    
    if (actualCount < EXPECTED_TRGM_INDEXES_COUNT) {
      console.warn(`⚠️ Предупреждение: ожидалось ${EXPECTED_TRGM_INDEXES_COUNT} триграммных индексов, найдено только ${actualCount}`)
      if (actualCount === 0 && failedCount === 0) {
        throw new Error('Индексы не были созданы, но ошибок не было зафиксировано. Возможно, проблема с правами доступа к БД.')
      }
    }
    
    return { createdCount, failedCount, actualCount }
  } catch (error) {
    const errorMessage = error?.message || String(error)
    console.error('❌ Ошибка при создании триграммных индексов:', errorMessage)
    throw error // Пробрасываем ошибку для обработки в вызывающем коде
  }
}

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

        equipment = rowData ? transformEquipmentInfo(rowData) : null
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
        
        equipment = rowData ? transformEquipmentInfo(rowData) : null
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
    // 1. Строим условия поиска
    const searchConditions = searchTerm ? {
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

    // 2. Строим условия фильтрации
    const filterConditions = filters && Object.entries(filters).flatMap(([key, values]) => {
      if (values.length > 0) {
        if (key === 'department') {
          return { department: { name: { in: values } } };
        }
        if (key === 'type') {
          return { type: { name: { in: values } } };
        }
        if (key === 'classification') {
          return { classification: { name: { in: values } } };
        }
        if (key === 'measurements') {
          return { measurements: { name: { in: values } } };
        }
        if (key === 'kind') {
          return { kind: { name: { in: values } } };
        }
        return { [key]: { in: values } };
      }
      return [];
    }) || [];

    const baseConditions = {
      ...(Object.keys(searchConditions).length > 0 ? searchConditions : {}),
      ...(filterConditions.length > 0 ? { AND: filterConditions } : {})
    };

    // 3. ОПТИМИЗАЦИЯ: Используем параллельные запросы
    const [groupedResults, totalCount, modelTotals, groupedAll] = await Promise.all([
      // Группировка с пагинацией в одном запросе
      prisma.Equipment.groupBy({
        by: ['modelId', 'departmentId'],
        where: baseConditions,
        _count: { _all: true },
        orderBy: [{ modelId: 'asc' }, { departmentId: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      
      // Общий счетчик
      prisma.Equipment.count({ where: baseConditions }),
      
      // Получаем общие количества по моделям
      prisma.Equipment.groupBy({
        by: ['modelId'],
        where: baseConditions,
        _count: { _all: true }
      }),

      // Считаем общее число карточек (уникальные пары modelId+departmentId) без пагинации
      prisma.Equipment.groupBy({
        by: ['modelId', 'departmentId'],
        where: baseConditions,
        _count: { _all: true }
      })
    ]);

    const modelIdToTotal = new Map(modelTotals.map(x => [x.modelId, x._count._all]));

    // 4. Получаем репрезентативные записи с обогащением
    const enriched = await Promise.all(groupedResults.map(async g => {
      const representative = await prisma.Equipment.findFirst({
        where: { 
          modelId: g.modelId, 
          departmentId: g.departmentId, 
          ...baseConditions 
        },
        include: {
          model: true,
          department: true,
          ...(login && isAuthenticated ? {
            favoriteEquipment: { where: { login } },
            operatingEquipment: true,
          } : {})
        },
        orderBy: [{ imgUrl: 'desc' }]
      });

      if (!representative) return null;

      return transformEquipmentList({
        ...representative,
        quantity: g._count._all,
        totalQuantity: modelIdToTotal.get(g.modelId) || g._count._all,
      });
    }));

    const results = enriched.filter(Boolean);

    return { 
      results, 
      totalEquipmentCards: groupedAll.length,
      totalEquipmentUnits: totalCount,
      page, 
      pageSize 
    };
  } catch (error) {
    console.error('Ошибка поиска:', error);
    
    // Обработка Prisma ошибок подключения
    if (isPrismaConnectionError(error)) {
      const errorMessage = `❌ Ошибка подключения к БД при поиске оборудования: ${error.message || 'Не удается подключиться к серверу БД'}`
      await sendNotification(errorMessage)
      throw { message: 'Проблемы с подключением к базе данных', status: 503 }
    }
    
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
    
    // Создаем триграммные индексы для оптимизации поиска
    await createTrgmIndexes()
    
    console.info('✅ База данных оборудования обновлена')
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error)
    throw error // Пробрасываем ошибку выше для обработки
  }
  // НЕ отключаем prisma здесь - это долгоживущий клиент для всего приложения
  // Отключение должно происходить только при graceful shutdown приложения

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
    
    // Обработка Prisma ошибок подключения
    if (isPrismaConnectionError(error)) {
      const errorMessage = `❌ Ошибка подключения к БД при получении фильтров: ${error.message || 'Не удается подключиться к серверу БД'}`
      await sendNotification(errorMessage)
      throw { message: 'Проблемы с подключением к базе данных', status: 503 }
    }
    
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
          processedBatch.map(data => prisma.Equipment.create({ data }))
        )
        successfulRecordsCount += processedBatch.length
      } catch (error) {
        console.error('Ошибка создания пакета оборудования:', error)
      }
    }

    console.log(`Создано ${successfulRecordsCount} записей оборудования со связями`)
    try {
      await notifyAdmins(`Создано ${successfulRecordsCount} записей оборудования со связями`)
    } catch (error) {
      // Игнорируем ошибки отправки уведомлений, чтобы не прерывать выполнение seed скрипта
      console.warn('Не удалось отправить уведомление админам:', error.message)
    }
    
  } catch (error) {
    console.error('Ошибка создания оборудования со связями:', error)
    throw error
  }
}

export async function getEquipmentCount() {
  try {
    // @ts-ignore
    const count = await prisma.Equipment.count()
    return count
  } catch (error) {
    console.error('Ошибка получения количества оборудования:', error)
    
    // Обработка Prisma ошибок подключения
    if (isPrismaConnectionError(error)) {
      const errorMessage = `❌ Ошибка подключения к БД при получении количества оборудования: ${error.message || 'Не удается подключиться к серверу БД'}`
      await sendNotification(errorMessage)
      throw { message: 'Проблемы с подключением к базе данных', status: 503 }
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

