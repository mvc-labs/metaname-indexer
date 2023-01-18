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

## Http interface

### Get name info
### Request
- Methos: **GET**
- URL: ```/getinfo?name=hello```
> * name: the metaname you want to search

### Response

```
{
    "code":0,
    "msg": "",
    "data":{
        "name":"hello",
        "expiredBlockTime":1705533953,
        "nftCodeHash":"48d6118692b459fabfc2910105f38dda0645fb57",
        "genesisId":"89e5006fe955b7c1aaeb870e35f27448b01fbad8",
        "tokenIndex":"5",
        "resolver":"e83bece2c0f3a64c6ed129b348b5551ff56c4c1664d5338a35a84d486e7506ed01000000",
        "infos":{
            "metaid":"",
            "mvc":"1K42FLdDsjWTYgXNRUMtyH4G3iEoGde4CY"
        }
    }
}
```

When code is 0, it means success. Otherwise it means failed and there will be a msg which describes the specific information.

data format:
> * name: metaname.
> * expiredBlockTime: the expire timestamp.
> * nftCodeHash: the code hash of the metaname nft.
> * genesisId: the genesis Id of the metaname nft.
> * tokenIndex: the token index of the metaname index.
> * resolver: the resolver outpoint used to store metaname infos on chain.
> * infos: the infos of the metaname.
