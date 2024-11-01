import { readFile, writeFile } from 'fs'

async function readJsonFile(path) {
  console.log('Событие: Чтение файла: ', path)
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      const parsedData = JSON.parse(Buffer.from(data))
      resolve(parsedData)
    })
  })
}

async function writeJsonFile(path, parsedData) {
  console.log('Событие: Запись файла: ', path)
  return new Promise((resolve, reject) => {
    writeFile(path, JSON.stringify(parsedData, null, 2), error => {
      if (error) {
        reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      resolve()
    })
  })
}

export { readJsonFile, writeJsonFile }
