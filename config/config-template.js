"use strict";
const config = {
    dataService: {
        tokenUrl: 'https://api-mvc-testnet.metasv.com',
    },
    log: {
        path: './logs/',
        level: 'debug',
        label: 'mnsIndexer',
        maxFiles: '60d',
    },
    http: {
        ip: '127.0.0.1',
        port: 35001,
    },
    // this is a config for mongodb
    db: {
        name: 'mvc-mns-testnet', // db name
        collection: 'name', // collection name
        uri: 'mongodb://user:password@ip:port', // db uri
        max_concurrency: 30
    },
    mnsCodeHash: '',
    mnsId: '',
    syncInterval: 10000, // ms
};
exports.config = config;
    