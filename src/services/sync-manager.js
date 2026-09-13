/**
 * Менеджер отслеживания статуса синхронизации БД из Google Sheets
 * Хранит состояние в памяти (синхронизация может быть только одна за раз)
 */

// Статусы синхронизации
const SyncStatus = {
  IDLE: 'idle',           // нет активной синхронизации
  RUNNING: 'running',     // синхронизация выполняется
  COMPLETED: 'completed', // синхронизация завершена успешно
  FAILED: 'failed',       // синхронизация завершилась ошибкой
}

// Описание этапов синхронизации
const SyncStages = {
  INIT: 'Инициализация синхронизации...',
  CLEAR_TABLES: 'Очистка таблиц...',
  FETCH_DATA: 'Загрузка данных из Google Sheets...',
  CREATE_FILTERS: 'Создание таблиц и фильтров...',
  CREATE_EQUIPMENT: 'Создание оборудования со связями...',
  CREATE_INDEXES: 'Создание триграммных индексов...',
  COMPLETED: 'Синхронизация завершена успешно!',
  FAILED: 'Синхронизация завершилась ошибкой',
}

// Отображение внутренних статусов на те, что понимает фронтенд
const publicStatuses = {
  [SyncStatus.IDLE]: SyncStatus.IDLE,
  [SyncStatus.RUNNING]: 'pending',
  [SyncStatus.COMPLETED]: 'success',
  [SyncStatus.FAILED]: 'error',
}

// Текущее состояние синхронизации
let currentState = {
  status: SyncStatus.IDLE,
  stage: null,
  stageDescription: null,
  progress: 0,          // 0-100
  error: null,
  startedAt: null,
  completedAt: null,
  equipmentCount: null, // количество созданных записей
}

/**
 * Получить текущий статус синхронизации
 */
export function getSyncStatus() {
  return { ...currentState }
}

/**
 * Получить статус в форме, которую ожидает фронтенд: он оперирует набором
 * idle/pending/success/error, а детали этапов оставляем дополнительными полями
 */
export function getPublicSyncStatus() {
  const publicStatus = publicStatuses[currentState.status] ?? SyncStatus.IDLE
  return { ...currentState, status: publicStatus }
}

/**
 * Установить текущий этап синхронизации
 */
export function setSyncStage(stage, description, progress) {
  currentState.stage = stage
  currentState.stageDescription = description
  currentState.progress = progress
}

/**
 * Начать синхронизацию
 */
export function startSync() {
  currentState = {
    status: SyncStatus.RUNNING,
    stage: SyncStages.INIT,
    stageDescription: SyncStages.INIT,
    progress: 0,
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    equipmentCount: null,
  }
}

/**
 * Завершить синхронизацию успешно
 */
export function completeSync(equipmentCount = 0) {
  currentState = {
    ...currentState,
    status: SyncStatus.COMPLETED,
    stage: SyncStages.COMPLETED,
    stageDescription: SyncStages.COMPLETED,
    progress: 100,
    completedAt: new Date().toISOString(),
    equipmentCount,
  }
}

/**
 * Завершить синхронизацию с ошибкой
 */
export function failSync(error) {
  currentState = {
    ...currentState,
    status: SyncStatus.FAILED,
    stage: SyncStages.FAILED,
    stageDescription: SyncStages.FAILED,
    error: error?.message || String(error),
    completedAt: new Date().toISOString(),
  }
}

/**
 * Сбросить статус в начальное состояние (через некоторое время после завершения)
 */
export function resetSync() {
  currentState = {
    status: SyncStatus.IDLE,
    stage: null,
    stageDescription: null,
    progress: 0,
    error: null,
    startedAt: null,
    completedAt: null,
    equipmentCount: null,
  }
}

export { SyncStatus, SyncStages }
