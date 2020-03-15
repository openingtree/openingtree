import ChessWebAPI from 'chess-web-api'
import { parse }  from './PGNParser'

export default class ChessComIterator {

    constructor(playerName, ready, showError) {
        let chessAPI = new ChessWebAPI({
            queue: true,
        });

        let parseGames= (archiveResponse)=>{
            ready(archiveResponse.body.games.filter(game=>game.rules==="chess").map(game=>parse(game.pgn)[0]))
        }

        let fetchAllGames = function(response) {
            response.body.archives.forEach((archiveUrl)=>{
                let components=archiveUrl.split('/')
                let year=components[components.length-2]
                let month=components[components.length-1]
                chessAPI.dispatch(chessAPI.getPlayerCompleteMonthlyArchives, parseGames, [playerName, year, month]);
            })
        }
        
        chessAPI.dispatch(chessAPI.getPlayerMonthlyArchives, fetchAllGames, [playerName]);
    }
}