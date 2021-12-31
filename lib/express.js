import express from 'express'

export const createExpressApp = (config, logger) => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    logger.debug('[Webserver] ' + req.method + ' ' + req.url + ' from ' + req.ip)
    next()
  })

  return app
}

export const startExpressServer = (expressApp, config, logger) => {
  return expressApp.listen(config.localPort, config.localIp, () => {
    logger.info(`[Webserver] harmony-magentatv-bridge listening at http://${config.localHostnameAndPort} / http://${config.externalHostnameAndPort}`)
  })
}
