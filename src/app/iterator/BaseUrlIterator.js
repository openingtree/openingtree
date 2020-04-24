import request from 'request'
import {normalizePGN} from './IteratorUtils'

export default class BaseUrlIterator {

    constructor(url, shouldNormalizePGN, responseCodeCallback, errorCallback, dataCallback, endCallback) {
        let remainingBody=''

        let requestObject = request.get(
                url, 
                { json: false }).on('error', errorCallback)
            .on('response',(response)=>{
                return responseCodeCallback(response.statusCode)
            }).on('data', (data) => {
                let newBody = shouldNormalizePGN? 
                    normalizePGN(remainingBody + data.toString()):
                    remainingBody + data.toString()
                let lastValidPGN = newBody.lastIndexOf(`\n\n\n`)
                let body = newBody.slice(0, lastValidPGN)

                remainingBody = newBody.slice(lastValidPGN)
                if(!this.callDataCallback(body, dataCallback)) {
                    requestObject.abort()
                }
            }).on('end', () => {
                this.callDataCallback(remainingBody, dataCallback)
                endCallback()
            })
    }

    callDataCallback(body, dataCallback) {
        let pgnArray = body.split(`\n\n\n`)
            .map(
                pgnString=> pgnString.replace(/^\s+|\s+$/g, '')//trim string
            )
        return dataCallback(pgnArray)

    }
}