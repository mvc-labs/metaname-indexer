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
    },
    mnsCodeHash: '38b0a77b5c84bfaba8b8cc39f729175c67111672',
    mnsId: '4b45149524803eafd4670ca79af72cabaf9bc5df',
    syncInterval: 30000, // ms
};
exports.config = config;
    