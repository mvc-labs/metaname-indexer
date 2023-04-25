"use strict";
const config = {
    dataService: {
        tokenUrl: 'https://mainnet.mvcapi.com', // mainnet
        //tokenUrl: 'https://testnet.mvcapi.com', // testnet
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
        name: 'mvc-mns', // db name
        collection: 'name', // collection name
        uri: 'mongodb://user:password@ip:port', // db uri
    },
    mnsCodeHash: '38b0a77b5c84bfaba8b8cc39f729175c67111672',
    mnsId: 'fb30609f90e5f3d18a870aa8994ec6da69ff5a56', // mainnet
    // mnsId: '6221cc5b542e70f5cb4659d90dd8e17441e26e4d', // testnet
    syncInterval: 30000, // ms
};
exports.config = config;
    