
const request = require('superagent')

import { logger as log } from './logger'
import { handleError } from './error';

// set timeout
const TIMEOUT = 120000 // 120s
const SEND_TX_TIMEOUT = 60000 // 60s

export class DataService {
    originalUrl: string
    tokenUrl: string
    network: string
    compress: boolean
    http2: boolean
    sendTxTimeout: number
    metasvKey: string

    constructor(config: any, network: string) {
        this.originalUrl = config.tokenUrl
        this.tokenUrl = config.tokenUrl
        this.network = network
        this.compress = config.compress || true
        this.http2 = false
        this.sendTxTimeout = SEND_TX_TIMEOUT
        if (config.sendTxTimeout) {
            this.sendTxTimeout = config.sendTxTimeout
        }
        this.metasvKey = '' 

        this.reloadConfig(config, network)
    }

    reloadConfig(config: any, network: string) {
        this.originalUrl = config.tokenUrl
        this.tokenUrl = config.tokenUrl
        this.network = network
        this.compress = config.compress || true
        this.http2 = false
        this.sendTxTimeout = SEND_TX_TIMEOUT
        if (config.sendTxTimeout) {
            this.sendTxTimeout = config.sendTxTimeout
        }
        //this.metasvKey = config.metasvKey
    }

    async getUniqueUtxo(codeHash: string, uniqueID: string) {
        const res = await request.get(
            `${this.tokenUrl}/contract/unique/genesis/${codeHash}/${uniqueID}/utxo`
        ).http2(this.http2).timeout(TIMEOUT)
        if (res.status !== 200) {
            log.error("getUniqueUtxo failed: res %s", res)
            return false
        }
        const utxos = res.body.map((utxo: any) => {
            return {txid: utxo.txid, outputIndex: utxo.txIndex}
        })
        return utxos
    }

    async getRawTx(txid: string) {
        let encoding = 'identity'
        if (this.compress === true) {
            encoding = 'gzip'
        }
        try {
            const res = await request.get(
                `${this.tokenUrl}/tx/${txid}/raw`)
                .set('Accept-Encoding', encoding).set('Authorization', this.metasvKey).http2(this.http2).timeout(TIMEOUT)
            if (res.status !== 200) {
                log.warn('getRawTx failed, txid %s, res %s, res.body %s', txid, res, res.body)
                return false
            }
            return res.body.hex
        } catch(err) {
            handleError(err)
            return false
        }
    }
}
