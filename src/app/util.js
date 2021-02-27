import * as Constants from '../app/Constants'
import * as Common from '../app/Common'

export function createSubObjectWithProperties(mainObject, properties) {
    let subObject = {}
    properties.forEach(property => {
        subObject[property] = mainObject[property]
    });
    return subObject
}
export function simplifiedFen(fen) {
    let fenComponents = fen.split(' ')
    if(fenComponents.length <=4) {
        return fen
    }
    //exclude move and halfMove components
    return `${fenComponents[0]} ${fenComponents[1]} ${fenComponents[2]}`
}

export function getTimeControlsArray(site,timeControlState, selected) {
    let allTimeControls = site === Constants.SITE_LICHESS ? 
        Common.LICHESS_TIME_CONTROLS : Common.CHESS_DOT_COM_TIME_CONTROLS
    return allTimeControls.filter((timeControl)=>!!timeControlState[timeControl] === selected)
}

export function simplifyCount(count){
    if(count>=1000000){
        return `${(count/1000000).toFixed(1)}M`
    }        
    if(count>=10000){
        return `${Math.round(count/1000)}k`
    }

    return count
}

export function getPerformanceDetails(totalOpponentElo, averageElo, white, draws, black, playerColor) {
    let totalGames = white + draws + black
    let averageOpponentElo = totalOpponentElo?Math.round(totalOpponentElo/totalGames):null
    let playerWins = playerColor === Constants.PLAYER_COLOR_BLACK?black:white
    let playerLosses = playerColor !== Constants.PLAYER_COLOR_BLACK?black:white
    let score = playerWins+(draws/2)
    let scorePercentage = score*100/totalGames
    let ratingChange = Common.DP_TABLE[Math.round(scorePercentage)]
    let performanceRating = null
    if(averageOpponentElo) {
        performanceRating = averageOpponentElo+ratingChange
    }
    return {
        results:`+${simplifyCount(playerWins)}-${simplifyCount(playerLosses)}=${simplifyCount(draws)}`,
        performanceRating:performanceRating,
        averageOpponentElo: averageOpponentElo,// avg rating of opponents only
        averageElo:averageElo, // avg rating of all players
        score:`${Number.isInteger(scorePercentage)?scorePercentage:scorePercentage.toFixed(1)}% for ${playerColor === Constants.PLAYER_COLOR_BLACK?'black':'white'}`,
        ratingChange:`${ratingChange===0?'':(ratingChange>0?'+':'-')}${Math.abs(ratingChange)}`
    }
}

export function isOpponentEloInSelectedRange(elo, range) {
    if(range[1]===Constants.MAX_ELO_RATING) {
        return elo>=range[0]
    }
    return elo<=range[1] && elo>=range[0]
}

export function isDateMoreRecentThan(date, than) {
    // give priority to game which has a date
    if(!than) {
        return false
    }
    if(!date) {
        return true
    } 
    return new Date(date)>new Date(than)
}