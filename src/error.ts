import {logger as log} from './logger'

export enum ErrorCode {
    NoError = 0,

    NameNotFound,
    MvcAddressNotFound,

    UnknownError = 101,
}

export const ErrorMsg = {
    [ErrorCode.NoError]: 'no error',
    [ErrorCode.NameNotFound]: 'name is not found',
    [ErrorCode.MvcAddressNotFound]: 'mvc address is not found',
    [ErrorCode.UnknownError]: 'unknown error',
}

export function errorMsg(code: number) {
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