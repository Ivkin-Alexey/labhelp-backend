import { researches } from './researches.js'
import localizations from './localizations.js'

const PORT = 8000
const HTTPS_PORT = 443
export const programmerChatID = 392584400
const jwtLifeTime = 3600 // seconds

const timeZoneRelativeToUTC = 3
const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app'
let editProfileUrl = webAppUrl + '/:chatID/editProfile'
const smiles = {
  researches: '👨‍ ‍🔬 ',
  closeMenu: '❌ ',
  equipment: '🔬 ',
  selectedEquipment: '⭐ ',
  profile: '👤 ',
}

const defaultKeyBoard = [
  [smiles.equipment + 'Оборудование'],
  [smiles.selectedEquipment + 'Избранное оборудование'],
  [smiles.profile + 'Мой профиль'],
]

const keyboards = {
  researches: researches.map(el => [smiles.researches + 'Направление "' + el.name + '"']),
  default: defaultKeyBoard,
}

const commands = [
  {
    command: '/start',
    description: 'Старт',
    access: 'all',
  },
  {
    command: '/help',
    description: 'Список команд',
    access: 'all',
  },
  {
    command: '/researches',
    description: 'Научные направления',
    access: 'all',
  },
  {
    command: '/addRandomUser',
    description: 'Добавить случайного пользователя',
    access: 'superAdmin',
  },
  {
    command: '/addRandomAdmin',
    description: 'Добавить случайного администратора',
    access: 'superAdmin',
  },
  {
    command: '/addRandomSuperAdmin',
    description: 'Добавить случайного суперадминистратора',
    access: 'superAdmin',
  },
  {
    command: '/deleteUsersWithEmptyChatID',
    description: 'Удалить пользователей с пустыми полями',
    access: 'superAdmin',
  },
  {
    command: '/reloadEquipmentDB',
    description: 'Создать заново базу данных по оборудованию',
    access: 'superAdmin',
  },
  {
    command: '/setReagentsManagerChatID',
    description: 'Установить чат Id менеджера по реактивам',
    access: 'superAdmin',
  },
]

const userCommands = commands.reduce((sum, cur) => {
  if (cur.access === 'all') return sum + '\n' + cur.command + ` - ` + cur.description
  else return sum
}, '')

const superAdminCommands = commands.reduce((sum, cur) => {
  return sum + '\n' + cur.command + ` - ` + cur.description
}, '')

const stickers = {
  hello: 'CAACAgIAAxkBAAEKTKtlA3vTRlxYTs35OSSO7Q3KDGFaogACIAADwZxgDGWWbaHi0krRMAQ',
  unknown: 'CAACAgIAAxkBAAEKTKllA3t2S-fQqmxvXRtqMQGH7WUB0AACJAADwZxgDEgkWrolDSiOMAQ',
  disagree: 'CAACAgIAAxkBAAEKTK1lA3wQ9mmPrPuKzR3IpJYl3zTA1AACLQADwZxgDOM08idy_5BlMAQ',
  agree: 'CAACAgIAAxkBAAEKTK9lA3xE6klY8CnTJ9rk7ve_c4HdJgACKQADwZxgDPBLqR6_2N98MAQ',
  ok: 'CAACAgIAAxkBAAEKTlNlBLDJzNKqxAvp52WGuh4FS4TLeAACLAADwZxgDLDdeXbj2CCVMAQ',
}

export {
  PORT,
  HTTPS_PORT,
  webAppUrl,
  keyboards,
  commands,
  stickers,
  researches,
  smiles,
  editProfileUrl,
  timeZoneRelativeToUTC,
  localizations,
  userCommands,
  superAdminCommands,
  jwtLifeTime,
}
