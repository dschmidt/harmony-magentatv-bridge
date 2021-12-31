import fs from 'fs'

import { KeyCodes as magentaTv } from '../lib/magentatv-remote.js'

const RokuToMagentaMap = {
  Up: magentaTv.Up,
  Down: magentaTv.Down,
  Left: magentaTv.Left,
  Right: magentaTv.Right,
  Select: magentaTv.Ok,
  Back: magentaTv.Back,
  Play: magentaTv.PausePlay,
  Rev: magentaTv.Rewind,
  Fwd: magentaTv.Forward,
  Search: magentaTv.Search,
  PowerOff: magentaTv.Power,
  Info: magentaTv.Record,
  Home: magentaTv.Home,
  InstantReplay: magentaTv.Exit
}

export default class RokuServer {
  constructor (magentaTvRemote, logger) {
    this.magentaTvRemote = magentaTvRemote
    this.logger = logger

    this.clients = []
  }

  setupExpress (expressApp) {
    // Send RootResponse.xml
    expressApp.get('/', (req, res) => {
      if (!this.clients.includes(req.ip)) {
        this.clients.push(req.ip)
        this.logger.log('[RokuServer] Logitech Hub at ' + req.ip + ' found me! Sending RootResponse.xml...')
      }
      res.type('application/xml')
      res.send(fs.readFileSync('RootResponse.xml', 'utf8'))
      res.end()
    })

    /// Button Event Handler
    expressApp.post('/keypress/:action', async (req, res) => {
      const action = req.params.action
      if (RokuToMagentaMap[action]) {
        this.logger.debug('[RokuServer] Received action', action, '. Mapping it to MagentaTV keycode: ', RokuToMagentaMap[action])
        // eslint-disable-next-line no-unused-vars
        const resp = this.magentaTvRemote.sendKeyCode(RokuToMagentaMap[action])
        // console.log('Response', await (await resp).text())
      } else {
        this.logger.warn('[RokuServer] action not found in mapping')
      }
      res.end()
    })
  }
}
