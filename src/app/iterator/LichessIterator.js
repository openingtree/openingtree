import { parse }  from '../PGNParser'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'
import BaseUrlIterator from './BaseUrlIterator'

export default class LichessIterator {

    constructor(accessToken, playerName, playerColor, advancedFilters, ready, showError) {
        let lichessBaseURL = `https://lichess.org/api/games/user/`
        let playerNameFilter = encodeURIComponent(playerName)
        let colorFilter = `?color=${playerColor}`
        let ratedFilter = `${advancedFilters[Constants.FILTER_NAME_RATED]==="all"?"":`&rated=${advancedFilters[Constants.FILTER_NAME_RATED]==="rated"?"true":"false"}`}`
        let selectedTimeFrameData = getSelectedTimeFrameData(advancedFilters[Constants.FILTER_NAME_SELECTED_TIMEFRAME], getTimeframeSteps())
        let timeSinceFilter = `${selectedTimeFrameData.fromTimeStamp?`&since=${selectedTimeFrameData.fromTimeStamp}`:""}`
        let timeUntilFilter = `${selectedTimeFrameData.toTimeStamp?`&until=${selectedTimeFrameData.toTimeStamp}`:""}`
        let selectedTimeControls = getTimeControlsArray(Constants.SITE_LICHESS, advancedFilters, true)
        let perfFilter = selectedTimeControls.length === 0 || selectedTimeControls.length === 6?
                "" : `&perfType=${selectedTimeControls.join(",")}`
        new BaseUrlIterator(lichessBaseURL+playerNameFilter+colorFilter+ratedFilter+perfFilter+timeSinceFilter+timeUntilFilter, 
            this.getAuth(accessToken), false,
            (responseCode)=>{
                if(responseCode === 404) {
                    showError('Could not find lichess user ' + playerName)
                } else if (responseCode !== 200) {
                    showError('Could not load games of lichess user ' + playerName)
                }
            }, (error)=> {
                showError('Failed to connect to lichess.org. Lichess might be down right now', null, "Some addons like 'Piracy Badger' can also cause this.")
                ready([], false)
            }, (pgnStringArray) => {
                let parsedPGNs = pgnStringArray.map((pgnString)=> {
                    try {
                        return parse(pgnString)[0]
                    } catch (e) {
                        console.log("Failed to parse pgn", pgnString)
                        console.log(e)
                        trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedLichess", playerName)
                        return null
                    }
                })
    
                let continueProcessing = ready(parsedPGNs.filter((pgn)=>{
                    if(!pgn || pgn.headers.Variant !== "Standard") {
                        return false
                    }
                    let opponentElo = playerColor === Constants.PLAYER_COLOR_WHITE?pgn.headers.BlackElo:pgn.headers.WhiteElo
                    if(!isOpponentEloInSelectedRange(opponentElo, advancedFilters[Constants.FILTER_NAME_ELO_RANGE])) {
                        return false
                    }
                    return true
                }), true)
                return continueProcessing
            }, ()=>{
                ready([], false)
            })
    }

    getAuth(accessToken) {
        if(accessToken) {
            return {
                'bearer' : accessToken
            }
        }
        return null;
    }
}
