import request from 'request'

export default class BaseUrlIterator {

    constructor(url, responseCodeCallback, errorCallback, dataCallback, endCallback) {
        let remainingBody=''
        let requestObject = request.get(
                url, 
                { json: false }).on('error', errorCallback)
            .on('response',(response)=>{
                return responseCodeCallback(response.statusCode)
            }).on('data', (data) => {
            let newBody = remainingBody + data.toString();
            let lastValidPGN = newBody.lastIndexOf("\n\n\n")
            let body = newBody.slice(0, lastValidPGN).trim()

            remainingBody = newBody.slice(lastValidPGN).trim()
            let pgnsArray = body.split("\n\n\n")

            if(!dataCallback(pgnsArray)) {
                requestObject.abort()
            }
        }).on('end', () => {
            endCallback()
        })
    }
}