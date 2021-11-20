import request from 'request'
import * as Common from './Common'

export function fetchBookMoves(fen, variant, bookSettings, callback) {
    let ratings = bookSettings.openingBookRating
    let speeds = bookSettings.openingBookTimeControls
    let bookType = bookSettings.openingBookType
    let url = `https://explorer.lichess.ovh/${bookType}?fen=${fen}&play=&variant=${Common.lichessPerf(variant)}&ratings=${joinParams(ratings)}&speeds=${joinParams(speeds)}`
    request.get(url, (error, response) =>{
        if(error) {
            callback({fetch:"failed"})
            return 
        }
        try{
            callback(JSON.parse(response.body))
            return
        } catch (e) {
            console.log(e)
        }
        callback({fetch:"failed"})
    })
    return {fetch:"pending"}
    //https://explorer.lichess.ovh/lichess?fen=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201&play=&variant=kingOfTheHill&speeds%5B%5D=bullet&speeds%5B%5D=blitz&speeds%5B%5D=rapid&speeds%5B%5D=classical&ratings%5B%5D=1600&ratings%5B%5D=1800&ratings%5B%5D=2000&ratings%5B%5D=2200&ratings%5B%5D=2500

}

function joinParams(paramValues) {
    return paramValues.join(',')
}
