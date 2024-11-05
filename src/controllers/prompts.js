import path from 'path'
import { Prompt } from '../assets/constants/prompt.js'
import { readJsonFile, writeJsonFile } from './fs.js'
import { localizations } from '../assets/constants/constants.js'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'prompts.json')

async function sendPrompt(bot, chatID, msg, keyboard) {
  return new Promise((resolve, reject) => {
    try {
      const prompt = bot.sendMessage(chatID, msg, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      })
      resolve(prompt)
    } catch (e) {
      reject(e)
    }
  })
}

async function updatePrompts(id, topic, data) {
  return new Promise((resolve, reject) => {
    readJsonFile(jsonPath)
      .then(parsedData => {
        if (!parsedData[topic]) {
          reject(localizations.prompts.topicDoesntExist)
        } else {
          parsedData[topic] = parsedData[topic].map(el => {
            if (el.messageID === id) {
              for (let key in data) {
                el[key] = data[key]
              }
            }
          })
        }
        writeJsonFile(jsonPath, parsedData)
        resolve(parsedData)
      })
      .catch(e => reject(e))
  })
}

async function addNewPromptToDB(id, topic, data) {
  return new Promise((resolve, reject) => {
    readJsonFile(jsonPath)
      .then(parsedData => {
        if (!parsedData[topic]) {
          parsedData[topic] = []
        }
        const prompt = new Prompt(id, topic, data)
        parsedData[topic].push(prompt)
        writeJsonFile(jsonPath, parsedData)
        resolve(parsedData)
      })
      .catch(e => reject(e))
  })
}

async function getPrompt(bot, id, topic) {
  return new Promise((resolve, reject) => {
    readJsonFile(jsonPath)
      .then(parsedData => {
        const prompt = parsedData[topic].find(el => el.messageID === id)
        resolve(prompt)
      })
      .catch(e => reject(e))
  })
}

async function deletePrompt(id, topic) {
  return new Promise((resolve, reject) => {
    readJsonFile(jsonPath)
      .then(async parsedData => {
        if (!parsedData[topic]) {
          reject('Промпты с такой темой отсутствуют')
        } else {
          parsedData[topic] = parsedData[topic].filter(el => el.messageID !== id)
        }
        await writeJsonFile(jsonPath, parsedData)
        resolve(parsedData)
      })
      .catch(e => reject(e))
  })
}

export { sendPrompt, updatePrompts, deletePrompt, getPrompt, addNewPromptToDB }
