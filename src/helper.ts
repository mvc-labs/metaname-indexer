import { mvc } from "mvc-scrypt"

export function getBlockHeight(rabinMsg: string) {
    return Buffer.from(rabinMsg, 'hex').readUInt32LE(0)
}

export function readScriptChunkUInt(chunk) {
    let num = 0
    if (!chunk.buf) {
        num = chunk.opcodenum - 80
    } else {
        num = chunk.buf.readUIntLE(0, chunk.buf.length)
    }
    return num
}

export function decodeOutpoint(outpoint: string) {
    const txid = Buffer.from(outpoint.slice(0, 64), 'hex').reverse().toString('hex')
    const outputIndex = Buffer.from(outpoint.slice(64), 'hex').readUIntLE(0, 4)
    return { txid, outputIndex }
}

export function getOpreturndata(scriptBuf: Buffer) {
    const script = mvc.Script.fromBuffer(scriptBuf)
    const chunks = script.chunks
    const data = chunks[chunks.length - 1].buf
    return data
}

export async function sleep(delay: number) {
    await new Promise(resolve => setTimeout(resolve, delay));
}