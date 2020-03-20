import ChessWebAPI from 'chess-web-api'
import { parse }  from './PGNParser'
import request from 'request'

export default class ChessComIterator {

    constructor(playerName, playerColor, ready, showError, stopDownloading) {
        let chessAPI = new ChessWebAPI({
            queue: true,
        });
        let pendingRequests = 0;
        let parseGames= (archiveResponse)=>{
            let continueProcessing = ready(archiveResponse.body.games.filter(
                game=>game.rules==="chess" && game[playerColor].username === playerName).map(
                    game=> {
                        try {
                            return parse(game.pgn)[0]
                        } catch (e) {
                            console.log("failed to parse pgn", game)
                            console.log(e)
                            return null
                        }
                    }).filter(game=> game !== null))
            if(!continueProcessing) {
                //cancel all pending requests
                while(chessAPI.dequeue()){}
            }
            pendingRequests--
            if(pendingRequests<=0) {
                stopDownloading()
            }

        }

        let fetchAllGames = function(responseBody) {
            responseBody.archives.reverse().forEach((archiveUrl)=>{
                let components=archiveUrl.split('/')
                let year=components[components.length-2]
                let month=components[components.length-1]
                pendingRequests++
                chessAPI.dispatch(chessAPI.getPlayerCompleteMonthlyArchives, parseGames, [playerName, year, month]);
            })
        }
        request(`https://api.chess.com/pub/player/${playerName}/games/archives`, function (error, response, body) {
            if(error) {
                showError('Could not connect to chess.com')
            } else if(response.statusCode === 404) {
                showError('Could not find chess.com user '+playerName)
            } else if (response.statusCode !== 200) {
                showError('Could not load games for chess.com user '+playerName)
            } else {
                if(response.body) {
                    try{
                        let jsonBody = JSON.parse(response.body)
                        fetchAllGames(jsonBody)
                    }catch(e) {
                        showError('Could not find games for chess.com user '+playerName)
                    }
                }
            }
        });
    }
}