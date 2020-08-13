import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import * as Common from '../Common'
import BaseLichessIterator from './BaseLichessIterator'

export default class LichessIterator {

    constructor(variant, accessToken, playerName, playerColor, advancedFilters, ready, showError) {
        let lichessBaseURL = `https://lichess.org/api/games/user/`
        let playerNameFilter = encodeURIComponent(playerName)
        let colorFilter = `?color=${playerColor}`
        let ratedFilter = `${advancedFilters[Constants.FILTER_NAME_RATED]==="all"?"":`&rated=${advancedFilters[Constants.FILTER_NAME_RATED]==="rated"?"true":"false"}`}`
        let selectedTimeFrameData = getSelectedTimeFrameData(advancedFilters[Constants.FILTER_NAME_SELECTED_TIMEFRAME], getTimeframeSteps())
        let timeSinceFilter = `${selectedTimeFrameData.fromTimeStamp?`&since=${selectedTimeFrameData.fromTimeStamp}`:""}`
        let timeUntilFilter = `${selectedTimeFrameData.toTimeStamp?`&until=${selectedTimeFrameData.toTimeStamp}`:""}`
        let selectedTimeControls = getTimeControlsArray(Constants.SITE_LICHESS, advancedFilters, true)
        let perfFilter = `&perfType=${this.getPerfs(variant,selectedTimeControls)}`
        let url = lichessBaseURL+playerNameFilter+colorFilter+ratedFilter+perfFilter+timeSinceFilter+timeUntilFilter
        new BaseLichessIterator(accessToken, url, ready, showError, 
            (pgn)=>{
                if(!pgn || pgn.headers.Variant !== Common.lichessVariantHeader(variant)) {
                    return false
                }
                let opponentElo = playerColor === Constants.PLAYER_COLOR_WHITE?pgn.headers.BlackElo:pgn.headers.WhiteElo
                if(!isOpponentEloInSelectedRange(opponentElo, advancedFilters[Constants.FILTER_NAME_ELO_RANGE])) {
                    return false
                }
                return true
            },
            'Could not find lichess user ' + playerName,
            'Could not load games of lichess user ' + playerName)
    }

    getPerfs(variant, selectedTimeControls) {
        if(variant === Constants.VARIANT_STANDARD) {
            return selectedTimeControls.length === 0 || selectedTimeControls.length === 6?
                variant : `${selectedTimeControls.join(",")}`
        }
        return variant
    }

    timeControlFilter(appliedFilters, timeControlHeader){
        
    }
    getTimeSchedule(timeControl) {
        try {
            if(!timeControl.includes("+")){
                return Constants.TIME_CONTROL_CORRESPONDENCE
            }
            times = timeControl.split("+")
            let base = times[0]
            let inc = times[1]
            let total  = parseInt(base) + 40 * parseInt(inc)
            if(total<30) {
                Constants.TIME_CONTROL_ULTRA_BULLET
            } else if(total<120){

            } else if(total<120){

            }
        } catch (e) {
            return Constants.TIME_CONTROL_CORRESPONDENCE
        }
    }
}
