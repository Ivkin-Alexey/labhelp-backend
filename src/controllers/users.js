import { getConstantFromDB } from './updateConstants.js'
import { programmerChatID } from '../assets/constants/constants.js'

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

async function checkIsUserSuperAdmin(chatID) {
  return chatID === programmerChatID
}


export {
  checkIsUserReagentManager,
  checkIsUserSuperAdmin,
}
