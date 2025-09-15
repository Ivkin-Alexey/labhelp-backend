import { getConstantFromDB } from './updateConstants.js'
import { admins, programmerChatID } from '../assets/constants/constants.js'

async function checkIsUserReagentManager(chatID) {
  return new Promise((resolve, reject) => {
    getConstantFromDB('reagents', 'reagentsManagerChatID')
      .then(value => {
        if (+value === chatID) resolve()
        else reject('Пользователь не уполномочен выдавать реактивы')
      })
      .catch(e => reject(e))
  })
}

function checkIsUserSuperAdmin(chatID) {
  // Преобразуем chatID в число для корректного сравнения
  const numericChatID = Number(chatID)
  return numericChatID === programmerChatID || admins.includes(numericChatID)
}


export {
  checkIsUserReagentManager,
  checkIsUserSuperAdmin,
}
