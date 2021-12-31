#!/usr/bin/env node

import { startSsdpServer } from '../lib/ssdp.js'
import { createExpressApp, startExpressServer } from '../lib/express.js'
import MagentaTvRemote from '../lib/magentatv-remote.js'
import RokuServer from '../lib/roku-server.js'
import { randomUUID } from 'crypto'
import 'dotenv/config'

// Make eslint happy and wrap top level await in async function
// TODO: remove once eslint supports top level await ootb
(async () => {
  const env = process.env
  const config = {
    magentaTvPort: parseInt(env.MAGENTATV_PORT) || 8081,
    magentaTvIp: env.MAGENTATV_IP,
    localPort: parseInt(env.LOCAL_PORT) || 48124,
    localIp: env.LOCAL_IP,
    terminalId: env.TERMINAL_ID || randomUUID(),
    userId: env.USER_ID,
  }

  config.externalPort = parseInt(env.EXTERNAL_PORT) || config.localPort
  config.externalIp = env.EXTERNAL_IP || config.localIp

  config.magentaTvHostnameAndPort = `${config.magentaTvIp}:${config.magentaTvPort}`
  config.localHostnameAndPort = `${config.localIp}:${config.localPort}`
  config.externalHostnameAndPort = `${config.externalIp}:${config.externalPort}`

  console.log(config)

  const expressApp = createExpressApp(config, console)
  const magentaTvRemote = new MagentaTvRemote(config, console)
  const roku = new RokuServer(magentaTvRemote, console)
  roku.setupExpress(expressApp)
  magentaTvRemote.setupExpress(expressApp)

  const expressServer = startExpressServer(expressApp, config, console)

  await magentaTvRemote.connect()

  const ssdp = startSsdpServer(config, console)

  process.on('SIGINT', () => {
    expressServer.close()
    ssdp.stop()
    process.exit()
  })
})()
