import ChessWebAPI from 'chess-web-api'
import { parse }  from '../PGNParser'
import request from 'request'
import * as Constants from '../Constants'
import * as Common from '../Common'
import {isOpponentEloInSelectedRange} from '../util'
import {trackEvent} from '../Analytics'
import {normalizePGN} from './IteratorUtils'

export default class ChessComIterator {

    constructor(variant, playerName, playerColor, advancedFilters, ready, showError) {
        let chessAPI = new ChessWebAPI({
            queue: true,
        });
        let pendingRequests = 0;
        let parseGames= (archiveResponse)=>{
            pendingRequests--
            let continueProcessing = ready(archiveResponse.body.games.filter(
                game=>{
                    if(game.rules!==Common.chessDotComRules(variant) || game[playerColor].username.toLowerCase() !== playerName.toLowerCase()) {
                        return false
                    }
                    let ratedMode = advancedFilters[Constants.FILTER_NAME_RATED]
                    if(ratedMode === 'rated' && !game.rated) {
                        return false
                    } else if (ratedMode === 'casual' && game.rated) {
                        return false
                    }
                    if(!advancedFilters[game.time_class]) {
                        return false
                    }
                    let opponentFilter = advancedFilters[Constants.FILTER_NAME_OPPONENT]
                    if(opponentFilter) {
                        let opponent = playerColor === Constants.PLAYER_COLOR_WHITE?game.black.username:game.white.username
                        if(opponentFilter.toLowerCase() !== opponent.toLowerCase()) {
                            return false
                        }
                    }
                    
                    let opponentElo = playerColor === Constants.PLAYER_COLOR_WHITE?game.black.rating:game.white.rating
                    if(!isOpponentEloInSelectedRange(opponentElo, advancedFilters[Constants.FILTER_NAME_ELO_RANGE])) {
                        return false
                    }
                    return true 
                }).map(
                    game=> {
                        try {
                            return parse(normalizePGN(game.pgn))[0]
                        } catch (e) {
                            console.log("failed to parse pgn", game)
                            console.log(e)
                            trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedChessCom", `${playerName}:${playerColor}`)
                            return null
                        }
                    }).filter(game=> game !== null), pendingRequests>0)
            if(!continueProcessing) {
                //cancel all pending requests
                while(chessAPI.dequeue()){}
                pendingRequests = 0
                ready([],false)
            }
        }
        let shouldFetchGamesFromArchive = (archiveMonth,archiveYear, selectedTimeFrameData) => {
            let fromYear = selectedTimeFrameData.fromYear || 1970
            let toYear = selectedTimeFrameData.toYear || 10000
            let fromMonth = selectedTimeFrameData.fromYear || 0
            let toMonth = selectedTimeFrameData.toYear || 11
    
            if(archiveYear>fromYear && archiveYear<toYear) {
                return true
            }
            if(archiveYear<fromYear || archiveYear>toYear) {
                return false
            }
            if(archiveYear === fromYear) {
                return archiveMonth >= fromMonth
            }
            if(archiveYear === toYear) {
                return archiveMonth <= toMonth
            }
            console.log("should not happen")
            return true
        }
        let fetchAllGames = function(responseBody) {
            responseBody.archives.reverse().forEach((archiveUrl)=>{

                let components=archiveUrl.split('/')
                let year=components[components.length-2]
                let month=components[components.length-1]
                if(shouldFetchGamesFromArchive(month,year)) {
                    pendingRequests++
                    chessAPI.dispatch(chessAPI.getPlayerCompleteMonthlyArchives, parseGames, [playerName, year, month]);
                }
            })
            if(pendingRequests === 0) {
                showError('Could not find games for chess.com user '+playerName)
                ready([], false)
            }
        }

        request(`https://api.chess.com/pub/player/${playerName}/games/archives`, function (error, response, body) {
            if(error) {
                showError('Failed to connect to chess.com. chess.com might be down at the moment', null, "Some addons like 'Piracy Badger' can also cause this.")
                ready([], false)
            } else if(response.statusCode === 404) {
                showError('Could not find chess.com user '+playerName)
                ready([], false)
            } else if (response.statusCode !== 200) {
                showError('Could not load games for chess.com user '+playerName)
                ready([], false)
            } else {
                if(response.body) {
                    try{
                        let jsonBody = JSON.parse(response.body)
                        fetchAllGames(jsonBody)
                    }catch(e) {
                        showError('Could not find games for chess.com user '+playerName)
                        ready([], false)
                    }
                }
            }
        });
    }


}