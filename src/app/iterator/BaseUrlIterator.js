import request from 'request'
import {normalizePGN} from './IteratorUtils'
import {trimString} from '../Common'

export default class BaseUrlIterator {

    constructor(url, auth, shouldNormalizePGN, responseCodeCallback, errorCallback, dataCallback, endCallback) {
        let remainingBody=''

        let requestObject = request.get(
                url, 
                { json: false , 
                    auth: auth
                }).on('error', errorCallback)
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
                pgnString=> trimString(pgnString)
            )
        return dataCallback(pgnArray)

    }
}