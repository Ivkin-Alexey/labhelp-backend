import { sendNotification } from "../controllers/tg-bot-controllers/botAnswers.js"
function processEndpointError(res, error) {
  if (error?.message) {
    console.error(error.message)
    sendNotification(error.message)
    return res.status(error.status).json(error.message)
  } else {
    console.error(error)
    sendNotification(error)
    return res.status(500).json(error)
  }
}

export { processEndpointError }
