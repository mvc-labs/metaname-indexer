import {logger as log} from './logger'

export enum ErrorCode {
    NoError = 0,
    UnknownError = 101,
    InvalidRequestIndex,
    RegisterFailed,
    NameRegisterFeeNotEnough,
    NameNotRegistered,
    NameAlreadyRegistered,
    NameIllegal,
    NeedUpdateMnsInfo,
    InvalidInputNftID,
    InvalidInputNftCodeHash,
    InvalidNftInputAddress,
    InvalidNftTx,
    IllegalYear,
    PriceHasChanged,
    GetPriceFailed,
    ResolverDataLengthIllegal,

    // common
    MvcAmountNotEnough,
    MvcAddressIllegal,
    NeedUpdateSwapInfo,
    InvalidTokenInputAmount,
    InvalidTokenInputAddress,
    SendTxFailed,
    RefundTokenAndMvcFailed,
    GetRabinSigFailed,
    InvalidSenderAddress,
    InvalidInputTokenID, 
    InvalidInputTokenCodeHash,
    Token1AmountTooLittle,
    TxFeeRateTooLittle,
    MismatchOpCode,
    RefundTokenIllegalOpcode,
    MvcAddAmountIllegal,
    InputTxIllegal,
    RequestAlreadyCalled,
    RefundOnlyNftRes,
    MissingInputs,
    TxnMempoolConflict,
    Token2AmountTooMuch,
    Token2AmountTooLittle,
    GetRawTxFailed,
    GetBlockHeightFailed,

    SpecificError = 10000,
}

export const ErrorMsg = {
    [ErrorCode.NoError]: 'no error',
    [ErrorCode.UnknownError]: 'unknown error',
    [ErrorCode.InvalidRequestIndex]: 'invalid request index',
    [ErrorCode.GetRabinSigFailed]: 'get rabin sig failed',
    [ErrorCode.RegisterFailed]: "register op failed",
    [ErrorCode.NameRegisterFeeNotEnough]: 'name register fee not enough',
    [ErrorCode.NameNotRegistered]: 'name not registered',
    [ErrorCode.NameAlreadyRegistered]: 'name already registered',
    [ErrorCode.NameIllegal]: 'name is illegal',
    [ErrorCode.NeedUpdateMnsInfo]: 'need update mns info',
    [ErrorCode.InvalidInputNftID]: 'invalid nft id',
    [ErrorCode.InvalidInputNftCodeHash]: 'invalid nft code hash',
    [ErrorCode.InvalidNftInputAddress]: 'invalid nft address',
    [ErrorCode.InvalidNftTx]: 'invalid nft tx or outputindex',
    [ErrorCode.RefundOnlyNftRes]: 'refund only has nftRes',
    [ErrorCode.IllegalYear]: 'year num is illegal',
    [ErrorCode.PriceHasChanged]: 'price has changed over 10%',
    [ErrorCode.GetPriceFailed]: 'get mvc price failed',
    [ErrorCode.ResolverDataLengthIllegal]: 'resovler data length illegal',

    // common
    [ErrorCode.MvcAmountNotEnough]: 'mvc amount send is not enough',
    [ErrorCode.MvcAddAmountIllegal]: 'mvc address send is wrong',
    [ErrorCode.NeedUpdateSwapInfo]: 'swap has been changed, need update',
    [ErrorCode.InvalidTokenInputAmount]: 'invalid token input amount',
    [ErrorCode.InvalidTokenInputAddress]: 'invalid token input address',
    [ErrorCode.SendTxFailed]: 'sendTx failed',
    [ErrorCode.RefundTokenAndMvcFailed]: 'refund token and mvc failed',
    [ErrorCode.GetRabinSigFailed]: 'get rabin sig failed',
    [ErrorCode.InvalidSenderAddress]: 'invalid sender address',
    [ErrorCode.InvalidInputTokenID]: 'invalid input token id',
    [ErrorCode.InvalidInputTokenCodeHash]: 'invalid input token code hash',
    [ErrorCode.Token1AmountTooLittle]: 'token1 add amount is too little',
    [ErrorCode.TxFeeRateTooLittle]: 'tx fee rate is too little',
    [ErrorCode.MismatchOpCode]: 'request op code dismatch',
    [ErrorCode.RefundTokenIllegalOpcode]: 'refundToken opcode is illegal',
    [ErrorCode.MvcAddAmountIllegal]: 'token1AddAmount must be greater than 0',
    [ErrorCode.InputTxIllegal]: 'input transaction is illegal',
    [ErrorCode.RequestAlreadyCalled]: 'this request has already been executed',
    [ErrorCode.MissingInputs]: 'missing inputs',
    [ErrorCode.TxnMempoolConflict]: '258: txn-mempool-conflict',
    [ErrorCode.Token2AmountTooMuch]: 'token2 add amount is too much',
    [ErrorCode.Token2AmountTooLittle]: 'token2 add amount is too little',
    [ErrorCode.GetRawTxFailed]: 'get rawtx failed',
    [ErrorCode.GetBlockHeightFailed]: 'get block height failed',
}

export function errorMsg(code: number) {
    if (code === ErrorCode.SpecificError) {
        return getErrorDetail()
    }
    return ErrorMsg[code] || 'undefined error'
}

export function handleError(error: any) {
    // Error
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        log.error('Response Error: request %s, response %s, request %s, headers %s, data %s', error.request, error.response, error.response.request, error.response.headers, error.response.data)
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the
        // browser and an instance of
        // http.ClientRequest in node.js
        log.error('Request Error: %s', error.request);
    }
    log.error('Error message: %s', error.message)
    log.error('Error stack: %s', error.stack)
    if (error.context) {
        log.eror('Error context: %s', error.context);
    }
}

export function handleErrorClient(error: any) {
    handleError(error)
}

let errorDetail = ''
export function setErrorDetail(detail: string) {
    errorDetail = detail
}

export function getErrorDetail() {
    let msg = errorDetail
    errorDetail = ''
    return msg
}