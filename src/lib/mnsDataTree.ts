import { mvc } from 'mvc-scrypt'
import { MerkleTreiLeaf, MerkleTreiTree } from "./merkleTreiTree"
const Common = require('./common')

export class MnsLeafNode implements MerkleTreiLeaf {
    expiredBlockHeight: number
    nftCodeHash: Buffer
    nftID: Buffer
    resolver: Buffer
    name: Buffer
    tokenIndex: bigint
    genesisRaw: Buffer

    static size() {
        return 100
    }

    constructor(name: Buffer, expiredBlockHeight: number, nftCodeHash: Buffer, genesisRaw: Buffer, tokenIndex: bigint, resolver: Buffer) {
        this.name = name
        this.expiredBlockHeight = expiredBlockHeight
        this.genesisRaw = genesisRaw
        this.nftCodeHash = nftCodeHash
        this.tokenIndex = tokenIndex
        this.resolver = resolver

        this.nftID =  mvc.crypto.Hash.sha256ripemd160(Buffer.concat([Common.getUInt64Buf(tokenIndex), this.genesisRaw]))
    }

    get genesisID() {
        return mvc.crypto.Hash.sha256ripemd160(this.genesisRaw)
    }

    key() {
        return Common.toBigIntLE(this.keyBuffer())
    }

    keyBuffer() {
        return mvc.crypto.Hash.sha256ripemd160(this.name)
    }

    serialize() {
        return Buffer.concat([
            this.keyBuffer(), 
            Common.getUInt32Buf(this.expiredBlockHeight),
            this.nftCodeHash,
            this.nftID,
            this.resolver
        ])
    }
    
    static getExpiredBlockHeight(data: Buffer) {
        return data.readUInt32LE(20)
    }

    static getResolver(data: Buffer) {
        return data.subarray(64, 100)
    }

    getDataToDb() {
        return { 
            name: this.name.toString('hex'),
            nameStr: this.name.toString(),
            expiredBlockHeight: this.expiredBlockHeight,
            nftCodeHash: this.nftCodeHash.toString('hex'),
            genesisRaw: this.genesisRaw.toString('hex'),
            tokenIndex: this.tokenIndex,
            resolver: this.resolver.toString('hex'),
            genesisID: this.genesisID.toString('hex'),
        }
    }

    clone() {
        const leaf = new MnsLeafNode(Buffer.from(this.name), this.expiredBlockHeight, Buffer.from(this.nftCodeHash), Buffer.from(this.genesisRaw), this.tokenIndex, Buffer.from(this.resolver))
        return leaf
    }
}

export class MnsDataTree {
    dataTree: MerkleTreiTree

    constructor(leafArray: MnsLeafNode[]) {
        this.dataTree = new MerkleTreiTree(leafArray, MnsLeafNode.size())
    }

    static initFromTree(mnsDataTree: MnsDataTree) {
        const leafArray: MnsLeafNode[] = []
        for (const node of mnsDataTree.dataTree.leafNodes.values()) {
            leafArray.push((<MnsLeafNode>node).clone())
        }
        const newTree = new MnsDataTree(leafArray)
        return newTree
    }

    getNode(name: Buffer) {
        return this.dataTree.getNode(name)    
    }

    get merkleRoot() {
        return this.dataTree.merkleRoot
    }

    get size() {
        return this.dataTree.size
    }

    register(name: Buffer, expiredBlockHeight: number, nftCodeHash: Buffer, genesisRaw: Buffer, tokenIndex: bigint, resolver: Buffer) {
        if (this.getNode(name)) {
            return false
        }

        const leaf = new MnsLeafNode(name, expiredBlockHeight, nftCodeHash, genesisRaw, tokenIndex, resolver)

        const res = this.dataTree.updateLeafNode(leaf)
        return res
    }

    renew(name: Buffer, expiredBlockHeight: number) {
        let node = this.getNode(name)
        if (!node) {
            return false
        }

        const newNode = (<MnsLeafNode>node).clone()
        newNode.expiredBlockHeight = expiredBlockHeight
        return this.dataTree.updateLeafNode(newNode)
    }

    setResolver(name: Buffer, resolver: Buffer) {
        let node = this.getNode(name)
        if (!node) {
            return false
        }

        const newNode = (<MnsLeafNode>node).clone()
        newNode.resolver = resolver
        return this.dataTree.updateLeafNode(newNode)
    }
    
    compare(dataTree: MnsDataTree) {
        if (this.merkleRoot.compare(dataTree.merkleRoot) === 0) {
            return true
        }
        return false
    }
}