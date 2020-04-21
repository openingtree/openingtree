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
                let dataString = normalizeNewLine(data.toString())
                
                let newBody = (remainingBody + dataString).replace(/\n\n\[/g, `\n\n\n[`);
                let lastValidPGN = newBody.lastIndexOf(`\n\n\n`)
                let body = newBody.slice(0, lastValidPGN).trim()

                remainingBody = newBody.slice(lastValidPGN).trim()
                let pgnsArray = body.split(`\n\n\n`)
                                .map(
                                    pgnString=> pgnString.replace(/^\s+|\s+$/g, '')//trim string
                                )
                if(!dataCallback(pgnsArray)) {
                    requestObject.abort()
                }
            }).on('end', () => {
                endCallback()
            })
    }
}