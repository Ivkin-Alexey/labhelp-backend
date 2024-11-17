export function logRequestInfo(req, res, next) {
  console.info(`Запрос к серверу: метод ${req.method}, путь: ${req.path}`)
  next()
}
