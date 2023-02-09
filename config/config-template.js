"use strict";
const config = {
    dataService: {
        tokenUrl: 'https://api-mvc.metasv.com', // mainnet
        //tokenUrl: 'https://api-mvc-testnet.metasv.com', // testnet
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
    mnsId: ' c6f4ef79b4041e7928f6fe47b6874ba92646d894', // mainnet
    // mnsId: 'f33cf834cd29ebfa725529340d33997427ea2792', // testnet
    syncInterval: 30000, // ms
};
exports.config = config;
    