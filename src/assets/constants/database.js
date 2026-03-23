// Константы для работы с базой данных

// Ожидаемое количество триграммных индексов для оптимизации ILIKE поиска
// Должно соответствовать количеству индексов в scripts/apply_search_indexes.sql
export const EXPECTED_TRGM_INDEXES_COUNT = 12

// Список триграммных индексов для проверки
export const TRGM_INDEX_NAMES = [
  'idx_equipment_name_trgm',
  'idx_equipment_description_trgm',
  'idx_equipment_brand_trgm',
  'idx_equipment_serial_number_trgm',
  'idx_equipment_inventory_number_trgm',
  'idx_equipment_category_trgm',
  'idx_model_name_trgm',
  'idx_department_name_trgm',
  'idx_classification_name_trgm',
  'idx_measurement_name_trgm',
  'idx_equipment_type_name_trgm',
  'idx_equipment_kind_name_trgm',
]

