import { DbInterface } from './interface'
import { logger as log } from '../logger'
import { mvc } from 'mvc-scrypt'

const mongodb = require('mongodb')

export class MongoDb implements DbInterface {
    config: any
    client: any

    constructor(config) {
        this.config = config
        this.client = new mongodb.MongoClient(this.config.uri)
    }

    async connect() {
        await this.client.connect()
        await this.client.db(this.config.name).command({ ping: 1 });
        log.info("Connected successfully to server");
        // TODO: check index before create
        await this.leafs.createIndex({'infos.mvc': 1})
        await this.leafs.createIndex({'txid': 1})
        await this.leafs.createIndex({'mnsIndex': 1})
    }

    get leafs() {
        return this.client.db(this.config.name).collection(this.config.collection)
    }

    async clearData(txid: string) {
        const res = await this.leafs.find({'txid': txid}).toArray()
        if (res.length === 0) {
            const res2 = await this.leafs.deleteMany({})
            log.info('clearData: delete tx res %s', res2)
            return 0
        } else {
            const doc = res[0]
            const res2 = await this.leafs.deleteMany({'mnsIndex': {'$gt': doc.mnsIndex}})
            log.info('clearData: delete tx res %s', res2)
            return doc.mnsIndex
        }
    }

    async readAllData(handler: (leafData: any)=>void) {
        const cursor = this.leafs.find({})
        await cursor.forEach((doc) => {
            doc.nameHex = doc._id
            doc.tokenIndex = BigInt(doc.tokenIndex)
            handler(doc)
        })
    }

    async saveNode(data) {
        try { 
            data._id = data.name
            data.tokenIndex = mongodb.Long(data.tokenIndex, true)
            const res = await this.leafs.updateOne({'_id': data._id}, {'$set': data}, {'upsert': true})
            if (res.modifiedCount + res.upsertedCount === 1) {
                log.info('db.saveNode: %s', data)
                return true
            } else {
                log.error('db.saveNode: save failed %s', res)
                return false
            }
        } catch (err) {
            log.error('db.saveNode: error %s', err)
            return false
        }
    }

    async getNode(name: Buffer) {
        try {
            const doc = await this.leafs.findOne({'_id': name.toString('hex')})
            return {
                name: Buffer.from(doc._id, 'hex').toString(),
                expiredBlockTime: doc.expiredBlockTime,
                nftCodeHash: doc.nftCodeHash,
                genesisId: mvc.crypto.Hash.sha256ripemd160(Buffer.from(doc.genesisRaw, 'hex')).toString('hex'),
                tokenIndex: BigInt(doc.tokenIndex).toString(),
                resolver: doc.resolver,
                infos: doc.infos
            }
        } catch (err) {
            log.error('db.getNode: error %s, name %s', err, name.toString('hex'))
            return false
        }

    }

    async close() {
        this.client.close()
    }

    async clearDb() {
        await this.leafs.deleteMany({})
    }
}