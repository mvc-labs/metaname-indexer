import express = require('express')
import compression = require('compression')
import { initLogger, logger as log } from './logger'
import { handleError, errorMsg } from './error'
import { DataService } from './dataService'
import { MongoDb } from './db/mongodb'
import { MnsIndexer } from './mnsIndex'

const app = express()

const allowCors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'Content-Encoding']);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
};
app.use(allowCors)

function shouldCompress(req, res) {
    if (req.headers['accept-encoding'] && req.headers['accept-encoding'].indexOf('gzip') >= 0) {
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
}
app.use(compression({ filter: shouldCompress }))
app.use(express.json({limit: '1mb'}))

const server: any = {}

server.app = app
let mnsIndexer: MnsIndexer
let httpserver

server.start = function () {

    app.get('/', function(req, res) {
        res.json({ code: 0, data: 'metaname indexer api interface' })
    })

    app.get('/getinfo', async function (req, res) {
        try {
            let name = req.query.name
            if (!name || typeof name !== 'string') {
                res.json({code: 1, msg: 'invalid name args'})
                return
            }
            let expired = req.query.expired || false
            let [code, infos] = await mnsIndexer.getInfo(name, expired)
            if (code != 0) {
                res.json({code: code, msg: errorMsg(code)})
            } else {
                res.json({code: 0, data: infos})
            }
        } catch (err: any) {
            handleError(err)
            res.json({code: 1, msg: err.message})
        }
    })

    app.get('/getinfosbymvc',async function(req, res) {
        try {
            let mvc = req.query.mvc
            if (!mvc || typeof mvc !== 'string') {
                res.json({code: 1, msg: 'invalid mvc args'})
                return
            }
            let [code, infos] = await mnsIndexer.getInfosByMvc(mvc)
            if (code != 0) {
                res.json({code: code, msg: errorMsg(code)})
            } else {
                res.json({code: 0, data: infos})
            }
        } catch (err: any) {
            handleError(err)
            res.json({code: 1, msg: err.message})
        }
        
    })

    httpserver = app.listen(server.config.port, server.config.ip, async function () {
        log.info("start at listen %s:%s", server.config.ip, server.config.port)
    })
}

server.closeFlag = false

server.close = async function () {
    server.closeFlag = true
    await httpserver.close()
}

async function main() {
    const configPath = process.cwd() + '/' + process.argv[2]
    const {config} = await import(configPath)
    initLogger(config.log)

    const dataService = new DataService(config.dataService, config.network)
    const db = new MongoDb(config.db)
    mnsIndexer = new MnsIndexer(db, config.mnsCodeHash, config.mnsId, dataService, config.syncInterval)
    await mnsIndexer.start()
    server.config = config.http
    server.start()
}

main()