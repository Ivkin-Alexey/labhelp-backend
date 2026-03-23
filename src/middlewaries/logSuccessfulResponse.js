export function logSuccessfulResponse(req, res, next) {
  // Функция оставлена для совместимости, но логирование отключено
  // Успешные ответы логируются через logRequestInfo при входящем запросе
  next()
}
  
export function logRequestInfo(req, res, next) {
  const params = Object.keys(req.params).length > 0 ? ` params: ${JSON.stringify(req.params)}` : ''
  const query = Object.keys(req.query).length > 0 ? ` query: ${JSON.stringify(req.query)}` : ''
  console.info(`${req.method} ${req.path}${params}${query}`)
  next()
}