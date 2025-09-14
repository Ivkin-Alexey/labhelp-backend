import { createDate, createTime, createFullName } from '../../controllers/helpers.js'

const amountOfEquipment = 10000

const equipmentPageSize = 20

const defaultEquipmentPage = 1

const invalidCellData = ['нд', 'нет', 'б/н', 'б/н_1', 'будетскороприсвоен', 'ненабалансе', '?', '-', '_', 'б//н', 'Б/№', '', " "]


const fieldsToSearch = [
  'serialNumber',
  'inventoryNumber',
  'name',
  'description',
  'brand',
  'category',
]

const searchConfig = [
  // Прямые поля Equipment
  { field: 'serialNumber' },
  { field: 'inventoryNumber' },
  { field: 'name' },
  { field: 'description' },
  { field: 'brand' },
  { field: 'category' },
  
  // Связанные поля через relations
  { relation: 'model', field: 'name' },
  { relation: 'department', field: 'name' },
  { relation: 'classification', field: 'name' },
  { relation: 'measurements', field: 'name' },
  { relation: 'type', field: 'name' },
  { relation: 'kind', field: 'name' }
];

const invalidEquipmentCellData = ["", "-", " - "]

// Конфигурация для динамического создания фильтров
export const filterFieldsConfig = [
  { field: 'classification', label: 'Классификация', tableName: 'Classification' },
  { field: 'measurements', label: 'Измерения', tableName: 'Measurement' },
  { field: 'type', label: 'Тип', tableName: 'EquipmentType' },
  { field: 'kind', label: 'Вид', tableName: 'EquipmentKind' },
  { field: 'department', label: 'Подразделение', tableName: 'Department' }
]

export const equipmentFilterNames = filterFieldsConfig.map(el => el.field)

const equipmentItem = {
  inventoryNumber: 'Инвентарный №',
  category: 'Категория',
  name: 'Наименование оборудования',
  serialNumber: 'Заводской №',
  description: 'Область применения оборудования',
  brand: 'Изготовитель',
  model: 'Модель',
  imgUrl: 'Ссылки на фотографии',
  filesUrl:
    'Эксплуатационно-техническая документация\n' +
    '(ссылка на облако)\n' +
    '\n' +
    'Паспорт/руководство по эксплуатации',
  classification: 'Классификация оборудования',
  measurements: 'Вид измерений',
  type: 'Тип оборудования',
  kind: 'Вид оборудования',
  department: 'Наименование подразделения',
}

function WorkingEquipmentItem(equipmentId, userID, longUse = false) {
  this.id = equipmentId
  this.category = ''
  this.name = ''
  this.brand = ''
  this.model = ''
  this.imgUrl = ''
  this.filesUrl = ''
  this.userID = userID
  this.longUse = longUse
}

function StartData(chatID, login, accountData, equipment) {
  this.equipmentId = equipment.id
  this.date = createDate()
  this.startTime = createTime()
  this.fullName = createFullName(accountData)
  this.chatID = chatID
  this.login = login
  this.position = accountData?.position
  this.name = equipment.name + ' ' + equipment.model
}

function EndData() {
  this.endTime = createTime()
}

export {
  equipmentItem,
  invalidEquipmentCellData,
  invalidCellData,
  StartData,
  EndData,
  WorkingEquipmentItem,
  amountOfEquipment,
  fieldsToSearch,
  searchConfig,
  equipmentPageSize,
  defaultEquipmentPage
}
