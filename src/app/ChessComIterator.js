import ChessWebAPI from 'chess-web-api'
import { parse }  from './PGNParser'
import request from 'request'
import * as Constants from './Constants'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData} from './util'

export default class ChessComIterator {

    constructor(playerName, playerColor, advancedFilters, ready, showError, stopDownloading) {
        let chessAPI = new ChessWebAPI({
            queue: true,
        });
        let pendingRequests = 0;
        let parseGames= (archiveResponse)=>{
            let continueProcessing = ready(archiveResponse.body.games.filter(
                game=>{
                    if(game.rules!=="chess" || game[playerColor].username !== playerName) {
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
                    return true 
                }).map(
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
        let selectedTimeFrameData = getSelectedTimeFrameData(advancedFilters[Constants.FILTER_NAME_SELECTED_TIMEFRAME], getTimeframeSteps())
        let fetchAllGames = function(responseBody) {
            responseBody.archives.reverse().forEach((archiveUrl)=>{

                let components=archiveUrl.split('/')
                let year=components[components.length-2]
                let month=components[components.length-1]
                if(shouldFetchGamesFromArchive(month,year, selectedTimeFrameData)) {
                    pendingRequests++
                    chessAPI.dispatch(chessAPI.getPlayerCompleteMonthlyArchives, parseGames, [playerName, year, month]);
                }
                if(pendingRequests === 0) {
                    showError('Could not find games for chess.com user '+playerName)
                }
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