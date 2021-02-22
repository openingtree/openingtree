import {getTimeControlsArray, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import * as Common from '../Common'
import BaseLichessIterator from './BaseLichessIterator'

export default class LichessIterator {

    constructor(variant, accessToken, playerName, playerColor, advancedFilters, ready, showError) {
        let lichessBaseURL = `https://lichess.org/api/games/user/`
        let playerNameFilter = encodeURIComponent(playerName)
        let colorFilter = `?color=${playerColor}`
        let ratedFilter = `${advancedFilters[Constants.FILTER_NAME_RATED]==="all"?"":`&rated=${advancedFilters[Constants.FILTER_NAME_RATED]==="rated"?"true":"false"}`}`
        let fromDateFilter = advancedFilters[Constants.FILTER_NAME_FROM_DATE]
        let toDateFilter = advancedFilters[Constants.FILTER_NAME_TO_DATE]
        let timeSinceFilter = `${fromDateFilter?`&since=${fromDateFilter.getTime()}`:""}`
        let timeUntilFilter = `${toDateFilter?`&until=${toDateFilter.getTime()+Constants.MILLISECS_IN_DAY}`:""}`
        let selectedTimeControls = getTimeControlsArray(Constants.SITE_LICHESS, advancedFilters, true)
        let perfs =this.getPerfs(variant,selectedTimeControls)
        let perfFilter = perfs?`&perfType=${perfs}`:''
        let vsFilter = advancedFilters[Constants.FILTER_NAME_OPPONENT] ?`&vs=${advancedFilters[Constants.FILTER_NAME_OPPONENT]}`: ''
        let url = lichessBaseURL+playerNameFilter+colorFilter+ratedFilter+perfFilter+timeSinceFilter+timeUntilFilter+vsFilter
        new BaseLichessIterator(accessToken, url, ready, showError, 
            (pgn)=>{
                if(!pgn || pgn.headers.Variant !== Common.lichessVariantHeader(variant)
                    || !this.timeControlFilter(selectedTimeControls,pgn.headers.TimeControl)) {
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
                null : selectedTimeControls.join(",")
        }
        return Common.lichessPerf(variant)
    }


    timeControlFilter(appliedFilters, timeControlHeader){
        if(appliedFilters.length === 0 || appliedFilters.length == 6) {
            return true
        }
        return appliedFilters.includes(this.getTimeSchedule(timeControlHeader))
    }
    getTimeSchedule(timeControl) {
        try {
            if(!timeControl.includes("+")){
                return Constants.TIME_CONTROL_CORRESPONDENCE
            }
            let times = timeControl.split("+")
            let base = times[0]
            let inc = times[1]
            let total  = parseInt(base) + 40 * parseInt(inc)
            if (total<30) {
                return Constants.TIME_CONTROL_ULTRA_BULLET
            } else if (total<120){
                return Constants.TIME_CONTROL_BULLET
            } else if (total<480){
                return Constants.TIME_CONTROL_BLITZ
            } else if (total<1500){
                return Constants.TIME_CONTROL_RAPID
            } else {
                return Constants.TIME_CONTROL_CLASSICAL
            }
        } catch (e) {
            return Constants.TIME_CONTROL_CORRESPONDENCE
        }
    }
}
