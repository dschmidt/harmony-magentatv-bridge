
import {
  Server
} from 'node-ssdp'

export const startSsdpServer = (config, logger) => {
  const ssdp = new Server({
    location: `http://${config.externalHostnameAndPort}/`,
    udn: 'uuid:roku:ecp:HARMONYSPAN',
    ssdpSig: 'Server: Roku/9.3.0 UPnP/1.0 Roku/9.3.0'
  })

  ssdp.addUSN('roku:ecp')
  ssdp.start()
  logger.info('[ssdp] running and bound to all available network interfaces')

  return ssdp
}
