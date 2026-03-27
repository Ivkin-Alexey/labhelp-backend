import { prisma } from '../../../index.js'
import {
  defaultEquipmentPage,
  equipmentPageSize,
  fieldsToSearch,
  searchConfig,
  filterFieldsConfig,
  invalidEquipmentCellData,
  UNSPECIFIED,
} from '../../assets/constants/equipments.js'
import { EXPECTED_TRGM_INDEXES_COUNT } from '../../assets/constants/database.js'
import localizations from '../../assets/constants/localizations.js'
import { fetchEquipmentListFromGSheet } from '../../controllers/equipment-controller/g-sheet.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { clearTable } from '../common.js'
import { transformEquipmentInfo, transformEquipmentList } from '../helpers.js'
import { notifyAdmins } from '../../services/telegram-notifier.js'
import { isCellDataValid } from '../../controllers/equipment-controller/helpers.js'

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
        console.warn(msg)
        return null
      } else {
        return equipment
      }
    }))

    // Фильтруем null значения (не найденные записи) и возвращаем только найденные карточки
    const foundEquipments = equipments.filter(equipment => equipment !== null)
    
    return foundEquipments
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

async function createAllTablesAndFilters(list) {
    
    // Собираем уникальные значения для всех таблиц
    const tableData = {}

    // --- Departments ---
    const deptSet = new Set();
    let deptHasInvalid = false;
    list.forEach(item => {
      const trimmed = item?.department?.trim();
      if (isCellDataValid(trimmed)) {
        deptSet.add(trimmed);
      } else {
        deptHasInvalid = true;
      }
    });

    const finalDepts = buildFilterValues(deptSet, deptHasInvalid);
    tableData.department = finalDepts.map((name, index) => ({ id: index + 1, name }));

    // --- Models ---
    const modelSet = new Set();
    let modelHasInvalid = false;
    list.forEach(item => {
      const trimmed = item.model?.trim();
      if (isCellDataValid(trimmed)) {
        modelSet.add(trimmed);
      } else {
        modelHasInvalid = true;
      }
    });
    
    const finalModels = buildFilterValues(modelSet, modelHasInvalid);
    tableData.model = finalModels.map((name, index) => ({ id: index + 1, name }));
    
    // Собираем данные для фильтров (исключаем department и model, так как они уже обработаны)
    filterFieldsConfig.forEach(config => {
      // Пропускаем department и model, так как они обрабатываются отдельно
      if (config.field === 'department' || config.field === 'model') {
        return;
      }

      // Собираем уникальные значения и проверяем наличие невалидных
      const values = new Set();
      let hasInvalid = false;
      list.forEach(equipment => {
        const value = equipment[config.field];
        const trimmed = value?.trim();
        if (isCellDataValid(trimmed)) {
          values.add(trimmed);
        } else {
          hasInvalid = true;
        }
      });

      tableData[config.field] = buildFilterValues(values, hasInvalid);
    });
    
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

// Динамическое получение фильтров из БД
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
    const filters = filterFieldsConfig.map(config => {
      let names = dataMap[config.field]
        .map(item => item.name)
        .filter(name => !invalidEquipmentCellData.includes(name))

      // Ищем индекс "Не указано"
      const unspecifiedIndex = names.findIndex(name => name === UNSPECIFIED)
      if (unspecifiedIndex !== -1) {
        const unspecified = names[unspecifiedIndex]
        names.splice(unspecifiedIndex, 1) // удаляем из текущей позиции
        names.push(unspecified)           // добавляем в конец
      }

      return {
        name: config.field,
        label: config.label,
        options: names,
      }
    })
    
    return filters
  } catch (error) {
    console.error('Ошибка получения фильтров оборудования:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Создание оборудования с правильными связями (упрощенная версия)
// Создание оборудования с правильными связями
async function createEquipmentWithRelations(equipmentList) {
  try {
    console.log('Создание оборудования со связями...');

    // Запросы для получения всех справочников
    const prismaQueries = [
      prisma.model.findMany({ select: { id: true, name: true } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      ...filterFieldsConfig.map(config => 
        prisma[config.tableName].findMany({ select: { id: true, name: true } })
      )
    ];

    const results = await Promise.all(prismaQueries);
    const [models, departments] = results;

    // Мапы для быстрого поиска ID по имени
    const modelMap = new Map(models.map(m => [m.name, m.id]));
    const departmentMap = new Map(departments.map(d => [d.name, d.id]));

    const filterMaps = {};
    filterFieldsConfig.forEach((config, index) => {
      const data = results[index + 2];
      filterMaps[config.field] = new Map(data.map(item => [item.name, item.id]));
    });

    const BATCH_SIZE = 10;
    let successfulRecordsCount = 0;

    for (let i = 0; i < equipmentList.length; i += BATCH_SIZE) {
      const batch = equipmentList.slice(i, i + BATCH_SIZE);
      
      const processedBatch = batch.map(equipment => {
        const processedData = { ...equipment };

        // --- Обработка model ---
        const modelTrimmed = equipment.model?.trim();
        if (isCellDataValid(modelTrimmed)) {
          const modelId = modelMap.get(modelTrimmed);
          if (modelId) {
            processedData.modelId = modelId;
          }
        } else {
          // Для невалидных значений пробуем найти "Не указано"
          const unspecifiedId = modelMap.get(UNSPECIFIED);
          if (unspecifiedId) {
            processedData.modelId = unspecifiedId;
          }
        }
        delete processedData.model;

        // --- Обработка department ---
        const deptTrimmed = equipment.department?.trim();
        if (isCellDataValid(deptTrimmed)) {
          const deptId = departmentMap.get(deptTrimmed);
          if (deptId) {
            processedData.departmentId = deptId;
          }
        } else {
          // Для невалидных значений пробуем найти "Не указано"
          const unspecifiedId = departmentMap.get(UNSPECIFIED);
          if (unspecifiedId) {
            processedData.departmentId = unspecifiedId;
          }
        }
        delete processedData.department;

        // --- Обработка остальных фильтров ---
        filterFieldsConfig.forEach(config => {
          if (config.field === 'department' || config.field === 'model') {
            return;
          }
          
          const value = equipment[config.field];
          const trimmed = value?.trim();
          
          if (isCellDataValid(trimmed)) {
            const id = filterMaps[config.field].get(trimmed);
            if (id) {
              const fieldId = config.field === 'measurements' ? 'measurementId' : `${config.field}Id`;
              processedData[fieldId] = id;
            }
          } else {
            // Для невалидных значений пробуем найти "Не указано"
            const unspecifiedId = filterMaps[config.field].get(UNSPECIFIED);
            if (unspecifiedId) {
              const fieldId = config.field === 'measurements' ? 'measurementId' : `${config.field}Id`;
              processedData[fieldId] = unspecifiedId;
            }
          }
          delete processedData[config.field];
        });

        return processedData;
      });

      try {
        await prisma.$transaction(
          processedBatch.map(data => prisma.Equipment.create({ data }))
        )
        successfulRecordsCount += processedBatch.length
      } catch (error) {
        console.error('Ошибка создания пакета оборудования:', error);
      }
    }

    console.log(`Создано ${successfulRecordsCount} записей оборудования со связями`)
    try {
      await notifyAdmins(`Создано ${successfulRecordsCount} записей оборудования со связями`)
    } catch (error) {
      console.warn('Не удалось отправить уведомление админам:', error.message)
    }
    
  } catch (error) {
    console.error('Ошибка создания оборудования со связями:', error);
    throw error;
  }
}

function buildFilterValues(values, hasInvalid) {
  const sorted = Array.from(values).sort((a, b) => a.localeCompare(b));
    if(hasInvalid) {
      sorted.push(UNSPECIFIED)
    }
  return sorted;
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

