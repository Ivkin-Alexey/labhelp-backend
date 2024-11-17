export function logSuccessfulResponse(req, res, next) {
    const originalSend = res.send
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`Данные успешно отправлены для: метод ${req.method}, путь ${req.path}:`)
      }
      return originalSend.call(this, body)
    }
    next()
}
  
export function logRequestInfo(req, res, next) {
    console.info(`Запрос к серверу: метод ${req.method}, путь: ${req.path}`)
    next()
  }