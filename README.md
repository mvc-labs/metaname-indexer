# Metaname Indexer

This repo is used to sync metaname data from the latest blockchain transactions.

This indexer use mongodb as a database. You should install [mongodb](https://www.mongodb.com/) first.

## Install Dependencies

`npm install`

## Run

> * Copy `config/config-template.ts` into `config/config.ts`.

> * Replace the config items with your configuration.

> * Run command
```
tsc
NODE_ENV=production node ./compiled/src/httpServer.js config/config.js
```

## Re-sync all data
Removing `txid.txt`, then restart indexer.

## Double-spending

If there is a double-spending happening in metaname transactions. The indexer may need to re-sync all data from the beginning. 

So It's better to make a snapshot weekly of the database to save sync time. 
