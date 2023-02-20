# Metaname Indexer

This repo is used to sync metaname data from the latest blockchain transactions.

This indexer uses MongoDB as a database. You should install [MongoDB](https://www.mongodb.com/) first.

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

If there is a double-spending happening in Metaname transactions. The indexer may need to re-sync all data from the beginning. 

So It's better to make a snapshot weekly of the database to save sync time. 

## Http interface

### 1 Get name info
#### Request
- Methos: **GET**
- URL: ```/getinfo?name=hello```
> * name: the metaname you want to search

#### Response

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

### 2 Get infos by MVC address
#### Request
- Methos: **GET**
- URL: ```/getinfosbymvc?mvc=16U2MZ22T5kuuRCHNJUhuomn7FZcV9pDyS```
> * mvc: the mvc address you want to search

#### Response

```
{
    "code": 0,
    "data": [
        {
            "name": "test1",
            "nameHex": "6369766572",
            "expiredBlockTime": 1707984896,
            "nftCodeHash": "e205939ad9956673ce7da9fbd40514b30f66dc35",
            "genesisId": "a5cf55db26bd15c24b62684edb6154ccc06d79b5",
            "tokenIndex": "0",
            "resolver": "6a17c89fd3c422506d3343b76a8ba038bd7e3d84498f2eefe0b0116f32ab766c01000000",
            "infos": {
                "metaid": "",
                "mvc": "16U2MZ22T5kuuRCHNJUhuomn7FZcV9pDyS"
            },
            "txid": "3e98eb9663f16533efe1d27f1086983e0d6f3d05a18a40417e446ea6859c55b3"
        },
        {
            "name": "test2",
            "nameHex": "6368656e6734",
            "expiredBlockTime": 1708225838,
            "nftCodeHash": "e205939ad9956673ce7da9fbd40514b30f66dc35",
            "genesisId": "a5cf55db26bd15c24b62684edb6154ccc06d79b5",
            "tokenIndex": "28",
            "resolver": "1ac6f7fe3197f9ab05ead3ab14e328654625ad9bcd2ec206a2d1effa7760662600000000",
            "infos": {
                "metaid": "",
                "mvc": "16U2MZ22T5kuuRCHNJUhuomn7FZcV9pDyS"
            },
            "txid": "36e0e4348ce8a7b455c994e27a2ade7950c4b4365d6ec394386a812650cb2553"
        }
    ]
}
```

When code is 0, it means success. Otherwise it means failed and there will be a msg which describes the specific information.