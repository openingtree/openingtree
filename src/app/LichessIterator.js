import request from 'request'
import { parse }  from './PGNParser'

export default class LichessIterator {

    constructor(playerName, ready) {
        let remainingBody = ''
        request.get(`https://lichess.org/api/games/user/${encodeURIComponent(playerName)}`, { json: false }).on('data', (data) => {
            let newBody = remainingBody + data.toString();
            let lastValidPGN = newBody.lastIndexOf("\n\n\n")
            let body = newBody.slice(0, lastValidPGN).trim()

            remainingBody = newBody.slice(lastValidPGN).trim()
            let pgnsArray = body.split("\n\n\n")

            let parsedPGNs = pgnsArray.map((pgnString)=> {
                try {
                    return parse(pgnString)[0]
                } catch (e) {
                    console.log("failed to parse pgn", pgnString)
                    console.log(e)
                    return null
                }
            })

            ready(parsedPGNs.filter((pgn)=>{
                if(!pgn) {
                    return false
                }
                return pgn.headers.Variant === "Standard" &&
                    (pgn.headers.Black.toLowerCase() === playerName.toLowerCase() || pgn.headers.White.toLowerCase() === playerName.toLowerCase())
            }))
        })
    }
}