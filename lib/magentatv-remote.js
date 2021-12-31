import fetch from 'node-fetch'
import {
  createHash
} from 'crypto'
import {
  Socket
} from 'net'

// https://support.huawei.com/hedex/pages/DOC1100366313CEH0713H/01/DOC1100366313CEH0713H/01/resources/dsv_hdx_idp/DSV/en/en-us_topic_0094619112.html
export const KeyCodes = {
  Power: '0x0100',
  Home: '0x0110',
  PausePlay: '0x0107',
  Ok: '0x000D',
  VolUp: '0x0103',
  VolDown: '0x0104',
  ChUp: '0x0101',
  ChDown: '0x0102',
  Rewind: '0x0109',
  Forward: '0x0108',
  Record: '0x0461',
  Mute: '0x0105',
  Exit: '0x045D',
  Back: '0x0008',
  Up: '0x0026',
  Down: '0x0028',
  Left: '0x0025',
  Right: '0x0027',
  Search: '0x0451',
  Digit0: '0x0030',
  Digit1: '0x0031',
  Digit2: '0x0032',
  Digit3: '0x0033',
  Digit4: '0x0034',
  Digit5: '0x0035',
  Digit6: '0x0036',
  Digit7: '0x0037',
  Digit8: '0x0038',
  Digit9: '0x0039'
}

export default class MagentaTvRemote {
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      let url = 'http://' + this.config.magentaTvHostnameAndPort
      const msg = "SUBSCRIBE /upnp/service/X-CTC_RemotePairing/Event HTTP/1.1\r\nHOST: ' " + this.config.magentaTvHostnameAndPort + "'\r\nCALLBACK: <http://" + this.config.externalHostnameAndPort + '/magentatv/notify/>\r\nNT: upnp:event\r\nTIMEOUT: Second-300\r\nCONNECTION: close\r\n\r\n'

      const client = new Socket()
      client.connect(this.config.magentaTvPort, this.config.magentaTvIp, () => {
        client.write(msg)
      })
      client.on('data', () => {
        client.destroy()

        const soapBody = '<u:X-pairingRequest xmlns:u="urn:schemas-upnp-org:service:X-CTC_RemotePairing:1"><pairingDeviceID>' + this.config.terminalId + '</pairingDeviceID><friendlyName>iobroker</friendlyName><userHash>' + this.config.userHash + '</userHash></u:X-pairingRequest>'
        url = 'http://' + this.config.magentaTvHostnameAndPort + '/upnp/service/X-CTC_RemotePairing/Control'
        const soapXml = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' + soapBody + '</s:Body></s:Envelope>'
        const headers = {
          CONNECTION: 'CLOSE',
          'Content-Type': 'text/xml; charset=UTF-8',
          Accept: '',
          USER_AGENT: 'Darwin/16.5.0 UPnP/1.0 HUAWEI_iCOS/iCOS V1R1C00 DLNADOC/1.50',
          HOST: this.config.magentaTvHostnameAndPort,
          SOAPACTION: '"urn:schemas-upnp-org:service:X-CTC_RemotePairing:1#X-pairingRequest"'
        }

        fetch(url, {
          method: 'POST',
          headers: headers,
          body: soapXml
        }).then(resolve, reject)
      })
    })
  }

  sendKeyCode (keyCode) {
    const soapBody = '<u:X_CTC_RemoteKey xmlns:u="urn:schemas-upnp-org:service:X-CTC_RemoteControl:1"><InstanceID>0</InstanceID><KeyCode>keyCode=' + keyCode + '^' + this.config.terminalId + ':' + this.verificationCode + '^userHash:' + this.config.userHash + '</KeyCode></u:X_CTC_RemoteKey>'
    const soapXml = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' + soapBody + '</s:Body></s:Envelope>'
    const url = 'http://' + this.config.magentaTvHostnameAndPort + '/upnp/service/X-CTC_RemoteControl/Control'
    const headers = {
      CONNECTION: 'CLOSE',
      'Content-Type': 'text/xml; charset=UTF-8',
      Accept: '',
      USER_AGENT: 'Darwin/16.5.0 UPnP/1.0 HUAWEI_iCOS/iCOS V1R1C00 DLNADOC/1.50',
      HOST: this.config.magentaTvHostnameAndPort,
      SOAPACTION: '"urn:schemas-upnp-org:service:X-CTC_RemoteControl:1#X_CTC_RemoteKey"'
    }

    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: soapXml
    })
  }

  setupExpress (expressApp) {
    expressApp.use('*', (req, res, next) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })

      req.on('end', () => {
        if (body.indexOf('X-pairingCheck:') >= 0) {
          this.pairingCode = body.substring(body.indexOf('X-pairingCheck:') + 'X-pairingCheck:'.length, body.indexOf('</messageBody>'))
          this.verificationCode = createHash('md5').update(this.pairingCode + this.config.terminalId + this.config.userHash).digest('hex').toUpperCase()

          const soapBody = '<u:X-pairingCheck xmlns:u="urn:schemas-upnp-org:service:X-CTC_RemotePairing:1"><pairingDeviceID>' + this.config.terminalId + '</pairingDeviceID><verificationCode>' + this.verificationCode + '</verificationCode></u:X-pairingCheck>'
          const soapXml = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' + soapBody + '</s:Body></s:Envelope>'
          const url = 'http://' + this.config.magentaTvHostnameAndPort + '/upnp/service/X-CTC_RemotePairing/Control'
          const headers = {
            CONNECTION: 'CLOSE',
            'Content-Type': 'text/xml; charset=UTF-8',
            Accept: '',
            USER_AGENT: 'Darwin/16.5.0 UPnP/1.0 HUAWEI_iCOS/iCOS V1R1C00 DLNADOC/1.50',
            HOST: this.config.magentaTvHostnameAndPort,
            SOAPACTION: '"urn:schemas-upnp-org:service:X-CTC_RemotePairing:1#X-pairingCheck"'
          }

          fetch(url, {
            method: 'POST',
            headers: headers,
            body: soapXml
          })
        }
        res.end('')
        body = ''
      })
    })
  }
}
