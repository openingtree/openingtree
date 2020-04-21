import request from 'request'
import normalizeNewLine from 'normalize-newline'

export default class BaseUrlIterator {

    constructor(url, responseCodeCallback, errorCallback, dataCallback, endCallback) {
        let remainingBody=''

        let requestObject = request.get(
                url, 
                { json: false }).on('error', errorCallback)
            .on('response',(response)=>{
                return responseCodeCallback(response.statusCode)
            }).on('data', (data) => {
                // parser cannot handle \r characters
                // normalize newlines coverts everything to \n
                let dataString = normalizeNewLine(data.toString())
                
                // some pgn files dont have triple \n separating games
                // so converting all double \n with triple \n if it happens before a [
                // this separates games with atleast a triple \n
                let newBody = (remainingBody + dataString).replace(/\n\n\[/g, `\n\n\n[`);
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