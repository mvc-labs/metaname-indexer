
import { mvc } from "mvc-scrypt"
import uts46 = require('idna-uts46-hx')
import fs = require('fs')

import { DbInterface } from './db/interface';
import { MnsLeafNode, MnsDataTree } from './lib/mnsDataTree'
import { DataService } from './dataService';
import {logger as log} from './logger'
import { getBlockTime, readScriptChunkUInt, decodeOutpoint, getOpreturndata, sleep } from "./helper"
import MnsProto = require('./lib/mnsProto')
import NftProto = require('./lib/nftProto')
import { ErrorCode } from "./error";

const TXID_PATH = './txid.txt'

export class MnsIndexer {

    db: DbInterface
    mnsCodeHash: string
    mnsID: string
    syncInterval: number
    currentTxId: string
    mnsIndex: number = 0

    dataService: DataService
    mnsDataTree: MnsDataTree

    constructor(db: DbInterface, mnsCodeHash: string, mnsID: string, dataService: DataService, syncInterval: number) {
        this.db = db
        this.mnsCodeHash = mnsCodeHash
        this.mnsID = mnsID
        this.syncInterval = syncInterval
        this.dataService = dataService
        this.mnsDataTree = new MnsDataTree([])
        this.currentTxId = ''
        if (fs.existsSync(TXID_PATH)) {
            this.currentTxId = fs.readFileSync(TXID_PATH).toString()
        }
    }

    async start() {
        await this.db.connect()
        await this.syncFromTx(true)
        this.timer() 
    }

    /*
    * @function sync data from blockchain transactions
    */
    async syncFromTx(readDb?: boolean) {

        const leafArray: MnsLeafNode[] = []

        if (!this.currentTxId) {
            await this.db.clearDb()
        } else if (readDb) {
            this.mnsIndex = await this.db.clearData(this.currentTxId)
            function handleData(leafData) {
                const leafNode = new MnsLeafNode(
                    Buffer.from(leafData.nameHex, 'hex'),
                    leafData.expiredBlockTime,
                    Buffer.from(leafData.nftCodeHash, 'hex'),
                    Buffer.from(leafData.genesisRaw, 'hex'),
                    leafData.tokenIndex,
                    Buffer.from(leafData.resolver, 'hex')
                )
                leafArray.push(leafNode)
            }
            await this.db.readAllData(handleData)
            this.mnsDataTree = new MnsDataTree(leafArray)
            log.debug('MnsIndexer: after readAllData merkleRoot %s', this.mnsDataTree.merkleRoot.toString('hex'))
        }

        const mnsUtxos = await this.dataService.getUniqueUtxo(this.mnsCodeHash, this.mnsID)
        if ( mnsUtxos == false || mnsUtxos.length != 1) {
            log.error('get mns utxo failed %s', mnsUtxos)
            return
        }

        let utxo = mnsUtxos[0]
        let latestTxid = utxo.txid
        log.debug('latest mns utxo %s, currentTxId %s', utxo, this.currentTxId)

        const queue: any = []
        let first = true
        let merkleRoot

        while (true) {

            let txid = utxo.txid

            if (txid == this.currentTxId) {
                break
            }

            const rawTx = await this.dataService.getRawTx(txid)

            const tx = mvc.Transaction(rawTx)

            const root = MnsProto.getDataMerkleRoot(tx.outputs[0].script.toBuffer())

            if (first) {
                merkleRoot = root
                first = false
            }

            log.debug('parse txid %s, merkleRoot: %s', txid, root.toString('hex'))

            if (tx.inputs.length <= 2) {
                log.debug('genesis tx: %s', tx.id)
                break
            }

            // register
            if (tx.inputs.length === 4) {
                let unlockScript = new mvc.Script(tx.inputs[0].script)
                const nameBuf = unlockScript.chunks[2].buf
                const name = nameBuf.toString('hex')
                const nameStr = nameBuf.toString()
                const daysChunk = unlockScript.chunks[3]
                const resolver = unlockScript.chunks[4].buf.toString('hex')
                const days = readScriptChunkUInt(daysChunk)
                const blockTimeMsg = unlockScript.chunks[14].buf.toString('hex')
                const curBlockTime = getBlockTime(blockTimeMsg)
                const expiredBlockTime = curBlockTime + days * MnsProto.DAY_TIMESTAMP

                // nft script
                const nftScriptBuf = tx.outputs[1].script.toBuffer()
                const nftCodeHash = NftProto.getScriptCodeHash(nftScriptBuf).toString('hex')
                const genesisRaw = NftProto.getGenesisRaw(nftScriptBuf).toString('hex')
                const tokenIndex = NftProto.getTokenIndex(nftScriptBuf)
                const genesisID = NftProto.getGenesisID(nftScriptBuf).toString('hex')
                const data: any = {
                    name,
                    nameStr,
                    expiredBlockTime,
                    nftCodeHash,
                    genesisRaw,
                    tokenIndex,
                    resolver,
                    genesisID,
                    txid,
                    op: MnsProto.OP_REGISTER
                }
                queue.push(data)
            } else if (tx.inputs.length === 5) {
                // renew or updateInfo
                let unlockScript = new mvc.Script(tx.inputs[0].script)
                const nameBuf = unlockScript.chunks[2].buf
                const name = nameBuf.toString('hex')
                const nameStr = nameBuf.toString()
                const daysChunk = unlockScript.chunks[3]
                let resolver = unlockScript.chunks[4].buf.toString('hex')
                const days = readScriptChunkUInt(daysChunk)
                const opChunk = unlockScript.chunks[unlockScript.chunks.length - 1]
                const op = readScriptChunkUInt(opChunk)

                const oldLeafChunk = unlockScript.chunks[27]
                let expiredBlockTime = MnsLeafNode.getExpiredBlockTime(oldLeafChunk.buf)

                if (op === MnsProto.UPDATE_DATA_RENEW) {
                    expiredBlockTime = expiredBlockTime + days * MnsProto.DAY_TIMESTAMP
                    resolver = undefined
                }

                // nft script
                const nftScriptBuf = tx.outputs[1].script.toBuffer()
                const nftCodeHash = NftProto.getScriptCodeHash(nftScriptBuf).toString('hex')
                const genesisRaw = NftProto.getGenesisRaw(nftScriptBuf).toString('hex')
                const tokenIndex = NftProto.getTokenIndex(nftScriptBuf)
                const genesisID = NftProto.getGenesisID(nftScriptBuf).toString('hex')
                const data: any = {
                    name,
                    nameStr,
                    expiredBlockTime,
                    nftCodeHash,
                    genesisRaw,
                    tokenIndex,
                    genesisID,
                    txid,
                    op
                }
                if (resolver) {
                    data.resolver = resolver
                }
                queue.push(data)
            }

            let input = tx.inputs[1]
            let prevTxid = input.prevTxId.toString('hex')
            let prevOutputIndex = input.outputIndex

            utxo = {
                txid: prevTxid,
                outputIndex: prevOutputIndex
            }
        }

        let length = queue.length
        for (let i = length - 1; i >= 0; i--) {
            this.mnsIndex += 1
            let data = queue[i]
            data.mnsIndex = this.mnsIndex
            if (data.resolver) {
                const { txid, outputIndex } = decodeOutpoint(data.resolver)
                let rawTx = await this.dataService.getRawTx(txid)

                const tx = mvc.Transaction(rawTx)
                let scriptBuffer = tx.outputs[outputIndex].script.toBuffer()

                const infos = JSON.parse(getOpreturndata(scriptBuffer).toString())
                data.infos = infos
            }
            log.debug('update db data %s, info %s', data, data.infos)
            await this.db.saveNode(data)

            if (data.op == MnsProto.OP_REGISTER) {
                this.mnsDataTree.register(Buffer.from(data.name, 'hex'), data.expiredBlockTime, Buffer.from(data.nftCodeHash, 'hex'), Buffer.from(data.genesisRaw, 'hex'), data.tokenIndex, Buffer.from(data.resolver, 'hex'))
            } else if (data.op === MnsProto.UPDATE_DATA_RENEW) {
                this.mnsDataTree.renew(Buffer.from(data.name, 'hex'), data.expiredBlockTime)
            } else {
                this.mnsDataTree.setResolver(Buffer.from(data.name, 'hex'), Buffer.from(data.resolver, 'hex'))
            }

            log.debug('build: txid: %s, merkleRoot %s', data.txid, this.mnsDataTree.merkleRoot.toString('hex'))
        }

        if (latestTxid !== this.currentTxId) {
            // check merkle root
            if (this.mnsDataTree.merkleRoot.compare(merkleRoot) !== 0) {
                log.error('merkle root not match should be %s, actually %s', merkleRoot.toString('hex'), this.mnsDataTree.merkleRoot.toString('hex'))
                throw Error('merkle root not match')
            }
            this.currentTxId = latestTxid
            log.info('update currentTxId: %s', this.currentTxId)
            // write to the file
            fs.writeFileSync(TXID_PATH, this.currentTxId)
        }
    }

    async close() {
        await this.db.close()
    }

    getNode(name: Buffer) {
        const node = <MnsLeafNode>this.mnsDataTree.getNode(name)
        const now = Math.floor(Date.now() / 1000)
        if (!node || node.expiredBlockTime < now) {
            return null
        }
        return node
    }

    async getInfo(name: string) {

        const nameUni = uts46.toUnicode(name)
        const nameBuf = Buffer.from(nameUni)
        const node = this.getNode(nameBuf)
        if (!node) {
            return [ErrorCode.NameNotFound, '']
        }
        const res = await this.db.getNode(nameBuf) 
        return [0, res]
    }

    async getInfosByMvc(mvcAddress: string) {

        const nodes = await this.db.getNodesByMvc(mvcAddress)
        if (!nodes) {
            return [ErrorCode.MvcAddressNotFound, '']
        }
        const infos: any = []
        const now = Math.floor(Date.now() / 1000)
        for (const node of nodes) {
            if (node.expiredBlockTime > now) {
                infos.push(node)
            }
        }
        return [0, infos]
    }

    async timer() {
        log.info('MnsIndexer: timer start')
        while (true) {
            await sleep(this.syncInterval)
            try {
                await this.syncFromTx()
            } catch(err: any) {
                log.error('MnsIndexer: timer error: %s', err.message)
            }
        }
    }
}