const UniqueProto = require('./uniqueProto')
const ProtoHeader = require('./protoheader')

export const TOTAL_SUPPLY = BigInt('9223372036854775807') // 2 ** 63 - 1

export const OP_UPDATE_CONTRACT = 0
export const OP_REGISTER = 1
export const OP_UPDATE_DATA = 2

export const UPDATE_DATA_RENEW = 21
export const UPDATE_DATA_SET_RESOLVER = 22
export const UPDATE_DATA_RETURN_NFT = 23

export const DAYS_PER_YEAR = 365
export const DAY_TIMESTAMP = 86400

// satochis per days
const NAME_1_FEE = 1095892000;
const NAME_2_FEE = 109589200;
const NAME_3_FEE = 10958920;
const NAME_4_FEE = 2739730;
const NAME_OTHER_FEE = 273973;

const NFT_GENESIS_HASH_LEN = 20
const DATA_MERKLE_ROOT_LEN = 20
const BLOCK_HEIGHT_RABIN_PUBKEY_HASH_ARRAY_HASH_LEN = 20

const CONTRACT_HASH_ROOT_OFFSET = UniqueProto.FIX_HEADER_LEN + ProtoHeader.HASH_LEN;
const BLOCK_HEIGHT_RABIN_PUBKEY_HASH_ARRAY_HASH_OFFSET = CONTRACT_HASH_ROOT_OFFSET + BLOCK_HEIGHT_RABIN_PUBKEY_HASH_ARRAY_HASH_LEN;
const DATA_MERKLE_ROOT_OFFSET = BLOCK_HEIGHT_RABIN_PUBKEY_HASH_ARRAY_HASH_OFFSET + DATA_MERKLE_ROOT_LEN;
const ADMIN_ADDRESS_OFFSET = DATA_MERKLE_ROOT_OFFSET + ProtoHeader.ADDRESS_LEN;
const CHARGE_ADDRESS_OFFSET = ADMIN_ADDRESS_OFFSET + ProtoHeader.ADDRESS_LEN;
const NFT_GENESIS_HASH_OFFSET = CHARGE_ADDRESS_OFFSET + NFT_GENESIS_HASH_LEN;

export const CUSTOM_DATA_LEN = NFT_GENESIS_HASH_OFFSET - UniqueProto.FIX_HEADER_LEN

export const countNameFee = function(name: Buffer, days: number) {
    const nameLen = name.length
    let fee = NAME_OTHER_FEE
    if (nameLen == 1) {
        fee = NAME_1_FEE
    } else if (nameLen == 2) {
        fee = NAME_2_FEE
    } else if (nameLen == 3) {
        fee = NAME_3_FEE
    } else if (nameLen == 4) {
        fee = NAME_4_FEE
    }
    return fee * days
}

export const countNameSatoshis = function(name: Buffer, days: number) {

    const priceFee = countNameFee(name, days)
    let projFeeSatoshis = Math.floor(priceFee)
    return projFeeSatoshis
}

export const getNewScriptFromNewContractHashRoot = function(scriptBuf: Buffer, newContractHashRoot: Buffer) {
    return Buffer.concat([
        scriptBuf.subarray(0, scriptBuf.length - CONTRACT_HASH_ROOT_OFFSET),
        newContractHashRoot,
        scriptBuf.subarray(scriptBuf.length - CONTRACT_HASH_ROOT_OFFSET + ProtoHeader.HASH_LEN)
    ])
}

export const getNewScriptFromDataMerkleRoot = function (scriptBuf: Buffer, dataMerkleRoot: Buffer) {
    return Buffer.concat([
        scriptBuf.subarray(0, scriptBuf.length - DATA_MERKLE_ROOT_OFFSET),
        dataMerkleRoot,
        scriptBuf.subarray(scriptBuf.length - DATA_MERKLE_ROOT_OFFSET + DATA_MERKLE_ROOT_LEN, scriptBuf.length)
    ])
}

export const getDataMerkleRoot = function (scriptBuf: Buffer) {
    return scriptBuf.subarray(scriptBuf.length - DATA_MERKLE_ROOT_OFFSET, scriptBuf.length - DATA_MERKLE_ROOT_OFFSET + DATA_MERKLE_ROOT_LEN)
}

export const getNewScriptFromCustomData = function(scriptBuf: Buffer, customData: Buffer) {
    return Buffer.concat([
        scriptBuf.subarray(0, scriptBuf.length - CUSTOM_DATA_LEN - UniqueProto.FIX_HEADER_LEN),
        customData,
        scriptBuf.subarray(scriptBuf.length - UniqueProto.FIX_HEADER_LEN)
    ])
}
